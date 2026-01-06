import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('payment_sessions')
export class PaymentSession extends BaseEntity {
  @Column()
  planId: string;

  @Column()
  churchId: string;

  @Column()
  sessionId: string;

  @Column({ default: 'pending' })
  status: string;
}
