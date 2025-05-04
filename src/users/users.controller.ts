// src/users.controller.ts
import { Controller, Post, Get } from '@nestjs/common';
import { CsvProcessorService } from './csv-processor.service';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly csvSvc: CsvProcessorService) {}

  /** POST /users/upload */
  @Post('upload')
  async upload(): Promise<{ message: string }> {
    await this.csvSvc.processCsv();
    return { message: 'CSV processed successfully' };
  }

  /** GET /users */
  @Get()
  async list(): Promise<User[]> {
    return this.csvSvc.getAll();
  }

  /** GET /users/stats */
  @Get('stats')
  async stats(): Promise<Record<string, number>> {
    return this.csvSvc.getStats();
  }
}
