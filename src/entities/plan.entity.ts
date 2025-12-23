import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn } from 'typeorm';
import { ChurchSubscription } from './church-subscription.entity';

@Entity('plans')
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // BASIC, PRO, ENTERPRISE

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amountDolar: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amountEuro: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amountReal: string;

  @Column({ default: 99999999 })
  memberLimit: number; 

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
  
  @Column({ default: 0 })
  freeDays: number; // Trial period

  @OneToMany(() => ChurchSubscription, (subscription) => subscription.plan)
  subscriptions: ChurchSubscription[];
}
