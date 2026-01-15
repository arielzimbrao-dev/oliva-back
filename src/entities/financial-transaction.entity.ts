
import { BaseEntity } from 'src/common/base.entity';
import { Entity, Column } from 'typeorm';


export enum FinancialTransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum RecurrenceType {
  ONE_TIME = 'ONE_TIME',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

@Entity('financial_transactions')
export class FinancialTransaction extends BaseEntity {
  @Column({ type: 'date' })
  date: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  category: string;

  @Column({ type: 'enum', enum: FinancialTransactionType })
  type: FinancialTransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ default: false })
  isPaid: boolean;

  @Column({ type: 'enum', enum: RecurrenceType, default: RecurrenceType.ONE_TIME })
  recurrenceType: RecurrenceType;

  @Column({ nullable: true })
  recurrenceInterval: number;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ nullable: true })
  nextOccurrenceDate: string;

  @Column({ default: true })
  isActive: boolean;
}
