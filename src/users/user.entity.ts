
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('int')
  age: number;

  // <— allow null here
  @Column({ type: 'jsonb', nullable: true })
  address: Record<string, any> | null;

  // <— and here
  @Column({ type: 'jsonb', name: 'additional_info', nullable: true })
  additionalInfo: Record<string, any> | null;
}
