import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { Church } from './church.entity';
import { Plan } from './plan.entity';

@Entity('church_subscriptions')
@Index(['churchId', 'planId'])
export class ChurchSubscription extends BaseEntity {

  @Column()
  churchId: string;

  @Column()
  planId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: string;

  @Column('varchar', { length: 3 })
  currency: string;

  @Column({ nullable: true })
  stripeCustomerId?: string;

  @Column({ nullable: true })
  stripeSubscriptionId?: string;

  @Column({ 
    type: 'enum',
    enum: ['pending', 'active', 'past_due', 'canceled', 'expired'],
    default: 'pending'
  })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  currentPeriodEnd?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  canceledAt?: Date;

  @ManyToOne(() => Church, (church) => church.subscriptions)
  @JoinColumn({ name: 'churchId' })
  church: Church;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  @JoinColumn({ name: 'planId' })
  plan: Plan;
}
