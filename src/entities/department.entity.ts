import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { Church } from './church.entity';
import { MemberDepartment } from './member-department.entity';

@Entity('departments')
export class Department extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;


  @Column()
  churchId: string;

  @Column({ nullable: true })
  color?: string;

  @ManyToOne(() => Church, (church) => church.departments, { nullable: false })
  @JoinColumn({ name: 'churchId' })
  church: Church;

  @OneToMany(() => MemberDepartment, (md) => md.department)
  memberDepartments: MemberDepartment[];
}
