import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Church } from './church.entity';
import { Plan } from './plan.entity';

@Entity('church_subscriptions')
@Index(['churchId', 'planId'])
@Index(['churchId', 'startDate'])
export class ChurchSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  churchId: string;

  @Column()
  planId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: string;

  @Column('varchar', { length: 3 })
  currency: string;

  @CreateDateColumn()
  startDate: Date;

  @Column({ nullable: true })
  endDate?: Date; // Cancellation date

  @ManyToOne(() => Church, (church) => church.subscriptions)
  @JoinColumn({ name: 'churchId' })
  church: Church;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  @JoinColumn({ name: 'planId' })
  plan: Plan;
}
