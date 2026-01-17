import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('payment_events')
@Index(['churchId'])
@Index(['sessionId'])
@Index(['subscriptionId'])
@Index(['processed'])
export class PaymentEvent extends BaseEntity {
  @Column()
  churchId: string;

  @Column({ nullable: true })
  customerId?: string;

  @Column({ nullable: true })
  sessionId?: string;

  @Column({ nullable: true })
  subscriptionId?: string;

  @Column()
  eventType: string;

  @Column('jsonb')
  eventData: any;

  @Column({ default: false })
  processed: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  processedAt?: Date;
}
