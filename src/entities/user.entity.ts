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

  @Column()
  role: string; // ADMIN, USER

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
