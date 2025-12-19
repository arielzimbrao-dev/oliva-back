import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Member } from './member.entity';
import { ChurchSubscription } from './church-subscription.entity';

@Entity('churches')
export class Church {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ unique: true })
  email: string;

  @ManyToOne(() => ChurchSubscription, (subscription) => subscription.church)
  currentSubscriptionPlan: ChurchSubscription; // FREE, BASIC, PRO

  @Column()
  status: string; // ACTIVE, SUSPENDED

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: 1 })
  memberActive: number; 

  @OneToMany(() => User, (user) => user.church)
  users: User[];

  @OneToMany(() => Member, (member) => member.church)
  members: Member[];

  @OneToMany(() => ChurchSubscription, (subscription) => subscription.church)
  subscriptions: ChurchSubscription[];
}
