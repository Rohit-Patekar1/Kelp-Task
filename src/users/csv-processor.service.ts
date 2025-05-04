import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository }       from '@nestjs/typeorm';
import { ConfigService }          from '@nestjs/config';
import { Repository }             from 'typeorm';
import * as fs                    from 'fs';
import * as csv                   from 'csvtojson';
import { User }                   from './user.entity';

@Injectable()
export class CsvProcessorService {
  private readonly logger = new Logger(CsvProcessorService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async processCsv(): Promise<void> {
    const path = this.config.get<string>('CSV_FILE_PATH');
    if (!path || !fs.existsSync(path)) {
      throw new Error(`Invalid CSV path: ${path}`);
    }

    this.logger.log(`Parsing CSV at ${path}…`);
    const rows: Record<string, any>[] = await csv({ trim: true }).fromFile(path);

    this.logger.log(`Found ${rows.length} rows, saving to DB…`);
    for (const row of rows) {
      const user = this.mapRow(row);
      await this.userRepo.save(user);
    }
    this.logger.log(' CSV import complete');
  }

  async getAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async getStats(): Promise<{
    under20: number;
    between20and40: number;
    between40and60: number;
    over60: number;
  }> {
    const users = await this.userRepo.find();
    const total = users.length || 1;
    const buckets = { under20: 0, between20and40: 0, between40and60: 0, over60: 0 };

    for (const { age } of users) {
      if (age < 20) buckets.under20++;
      else if (age <= 40) buckets.between20and40++;
      else if (age <= 60) buckets.between40and60++;
      else buckets.over60++;
    }

    return {
      under20:       (buckets.under20       / total) * 100,
      between20and40:(buckets.between20and40/ total) * 100,
      between40and60:(buckets.between40and60/ total) * 100,
      over60:        (buckets.over60        / total) * 100,
    };
  }

  private mapRow(row: Record<string, any>): User {
    const first = row.name?.firstName  ?? row['name.firstName']  ?? '';
    const last  = row.name?.lastName   ?? row['name.lastName']   ?? '';
    const age   = parseInt(row.age ?? '0', 10);
    let address: Record<string, any> | null = null;
    if (row.address && typeof row.address === 'object') {
      address = row.address;
    } else if (row['address.street']) {
      address = {};
      this.nest(address, ['street'], row['address.street']);
      this.nest(address, ['city'],   row['address.city']);
      this.nest(address, ['state'],  row['address.state']);
      this.nest(address, ['zip'],    row['address.zip']);
    }

    // additionalInfo: anything *not* name, age, or address
    const additional: Record<string, any> = {};
    for (const [key, val] of Object.entries(row)) {
      if (
        key === 'age'
        || key === 'name'
        || key === 'name.firstName'
        || key === 'name.lastName'
        || key === 'address'
        || key.startsWith('address.')
      ) {
        continue;
      }
      if (typeof val === 'object') {
        additional[key] = val;
      } else if (key.includes('.')) {
        this.nest(additional, key.split('.'), val);
      } else {
        additional[key] = val;
      }
    }

    const user = new User();
    user.name           = `${first} ${last}`.trim();
    user.age            = age;
    user.address        = address;
    user.additionalInfo = Object.keys(additional).length ? additional : null;
    return user;
  }

  private nest(obj: any, path: string[], value: any): void {
    let cur = obj;
    for (let i = 0; i < path.length; i++) {
      const part = path[i];
      if (i === path.length - 1) {
        cur[part] = value;
      } else {
        cur[part] = cur[part] || {};
        cur = cur[part];
      }
    }
  }
}
