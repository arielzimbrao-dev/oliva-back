import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { Member } from './member.entity';

export enum FamilyRelationType {
  CHILD = 'CHILD',
  SPOUSE = 'SPOUSE',
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
}


@Entity('member_families')
export class MemberFamily extends BaseEntity {
  @Column()
  memberId: string;

  @Column()
  relatedMemberId: string;

  @Column({ type: 'enum', enum: FamilyRelationType })
  relation: FamilyRelationType;

  @Column({ type: 'date', nullable: true })
  marriageDate?: Date;

  @ManyToOne(() => Member, { nullable: false })
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @ManyToOne(() => Member, { nullable: false })
  @JoinColumn({ name: 'relatedMemberId' })
  relatedMember: Member;
}
