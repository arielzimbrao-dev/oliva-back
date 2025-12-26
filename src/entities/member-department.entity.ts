import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Member } from './member.entity';
import { Department } from './department.entity';
import { BaseEntity } from 'src/common/base.entity';

@Entity('member_departments')
export class MemberDepartment extends BaseEntity {

  @Column()
  memberId: string;

  @Column()
  departmentId: string;

  @Column({ default: false })
  isLeader: boolean;

  @ManyToOne(() => Member, (member) => member.memberDepartments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @ManyToOne(() => Department, (department) => department.memberDepartments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'departmentId' })
  department: Department;
}
