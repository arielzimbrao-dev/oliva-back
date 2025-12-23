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


  @ManyToOne(() => Church, (church) => church.subscriptions)
  @JoinColumn({ name: 'churchId' })
  church: Church;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  @JoinColumn({ name: 'planId' })
  plan: Plan;
}
