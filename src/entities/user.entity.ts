import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { Member } from './member.entity';
import { Church } from './church.entity';
import { Role } from './role.entity';

@Entity('users')
@Index(['churchId'])
export class User extends BaseEntity {

  @Column()
  churchId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  roleId: string;

  @ManyToOne(() => Role, { nullable: false, eager: true })
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column()
  state: string; // ACTIVE, INACTIVE


  @Column({ nullable: true })
  confirmCode?: string;

  @OneToMany(() => Member, (member) => member.user)
  members: Member[];

  @ManyToOne(() => Church, (church) => church.users, { nullable: false })
  @JoinColumn({ name: 'churchId' })
  church: Church;
}
