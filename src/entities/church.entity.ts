import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { User } from './user.entity';
import { Member } from './member.entity';
import { ChurchSubscription } from './church-subscription.entity';
import { Department } from './department.entity';

@Entity('churches')
export class Church extends BaseEntity {

  @Column()
  name: string;

  @Column({ nullable: true })
  address?: string;


  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  foundationDate?: string;

  @Column({ nullable: true })
  preferredLanguage?: string;

  @Column({ nullable: true })
  preferredCurrency?: string;

  @Column({ unique: true })
  email: string;

  @ManyToOne(() => ChurchSubscription, (subscription) => subscription.church)
  currentSubscriptionPlan: ChurchSubscription; // FREE, BASIC, PRO

  @Column()
  status: string; // ACTIVE, SUSPENDED


  @Column({ default: 1 })
  memberActive: number; 

  @OneToMany(() => User, (user) => user.church)
  users: User[];

  @Column({ default: 0 })
  nextId: number;

  @OneToMany(() => Member, (member) => member.church)
  members: Member[];

  @OneToMany(() => Department, (department) => department.church)
  departments: Department[];

  @OneToMany(() => ChurchSubscription, (subscription) => subscription.church)
  subscriptions: ChurchSubscription[];
}
