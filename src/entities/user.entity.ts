import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Member } from './member.entity';
import { Church } from './church.entity';
import { Role } from './role.entity';

@Entity('users')
@Index(['churchId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  confirmCode?: string;

  @OneToMany(() => Member, (member) => member.user)
  members: Member[];

  @ManyToOne(() => Church, (church) => church.users, { nullable: false })
  @JoinColumn({ name: 'churchId' })
  church: Church;
}
