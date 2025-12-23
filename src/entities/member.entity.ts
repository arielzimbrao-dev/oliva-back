import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { User } from './user.entity';
import { Church } from './church.entity';

@Entity('members')
@Index(['userId'])
@Index(['churchId'])
export class Member extends BaseEntity {

  @Column()
  churchId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'date', nullable: false })
  birthDate: Date;

  @Column()
  status: string; // ACTIVE, INACTIVE

  @Column({ default: false, nullable: true })
  baptismStatus: boolean; // PENDING, COMPLETED


  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => User, (user) => user.members, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ManyToOne(() => Church, (church) => church.members, { nullable: false })
  @JoinColumn({ name: 'churchId' })
  church: Church;
}
