import { BaseEntity } from 'src/common/base.entity';
import { Entity, Column } from 'typeorm';

export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

@Entity('recurring_payments')
export class RecurringPayment extends BaseEntity {
  @Column()
  description: string;

  @Column()
  category: string;

  @Column()
  type: string; // INCOME or EXPENSE

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: RecurrenceFrequency })
  frequency: RecurrenceFrequency;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date', nullable: true })
  endDate?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date', nullable: true })
  lastGeneratedDate?: string;
}
