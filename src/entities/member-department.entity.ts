import { Entity, Column, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Member } from './member.entity';
import { Department } from './department.entity';

@Entity('member_departments')
export class MemberDepartment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
