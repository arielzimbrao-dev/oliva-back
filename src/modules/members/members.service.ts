import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { MemberRepository } from '../../entities/repository/member.repository';
import { DepartmentRepository } from '../../entities/repository/department.repository';
import { Member } from '../../entities/member.entity';
import { CreateMemberDto } from '../users/dtos/create-member.dto';
import { UpdateMemberDto } from '../users/dtos/update-member.dto';
import { MemberResponseDto, MemberListResponseDto, MemberDepartmentDto, MemberFamilyResponseDto } from './dtos/member-response.dto';
import { MemberDepartmentRepository } from '../../entities/repository/member-department.repository';
import { MemberFamilyRepository } from '../../entities/repository/member-family.repository';
import { FamilyRelationType } from '../../entities/member-family.entity';
import { ChurchRepository } from '../../entities/repository/church.repository';

@Injectable()
export class MembersService {
  constructor(
    private readonly memberRepository: MemberRepository,
    private readonly departmentRepository: DepartmentRepository,
    private readonly memberDepartmentRepository: MemberDepartmentRepository,
    private readonly memberFamilyRepository: MemberFamilyRepository,
    private readonly churchRepository: ChurchRepository,
  ) {}

  async findAll({ churchId, page = 1, limit = 10, filter = '' }: { churchId: string; page?: number; limit?: number; filter?: string }): Promise<MemberListResponseDto> {
    // Busca membros com departamentos
    const skip = (page - 1) * limit;
    const [members, total] = await this.memberRepository['memberRepository'].findAndCount({
      where: {
        churchId,
        ...(filter ? { name: filter } : {}),
        deletedAt: IsNull(),
      },
      relations: ['memberDepartments', 'memberDepartments.department'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return {
      total,
      page,
      limit,
      data: members.map(m => this.toMemberResponseDto(m)),
    };
  }

  async findOne(id: string): Promise<MemberResponseDto> {
    const member = await this.memberRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['memberDepartments', 'memberDepartments.department'],
    });
    if (!member) throw new NotFoundException('Member not found');
    // Busca relações familiares
    const families = await this.memberFamilyRepository.findAll({
      where: { memberId: id, deletedAt: IsNull() },
      relations: ['relatedMember'],
    });
    return this.toMemberResponseDto(member, families);
  }

  async create(data: CreateMemberDto & { churchId: string }): Promise<MemberResponseDto> {
    // Busca e incrementa nextId da church
    const church = await this.churchRepository.findOneById(data.churchId);
    if (!church) throw new NotFoundException('Church not found');
    const idMember = (church.nextId || 0) + 1;
    church.nextId = idMember;
    await this.churchRepository.save(church);
    // Cria membro com idMember
    const member = await this.memberRepository.create({
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      idMember,
    });
    // Associa departamentos se enviados
    if (data.departments && data.departments.length) {
      for (const dep of data.departments) {
        await this.memberDepartmentRepository.create({
          memberId: member.id,
          departmentId: dep.departmentId,
          isLeader: dep.isLeader,
        });
      }
    }
    // Associa relações familiares se enviados
    if (data.family && data.family.length) {
      for (const fam of data.family) {
        await this.memberFamilyRepository.create({
          memberId: member.id,
          relatedMemberId: fam.id,
          relation: fam.type as FamilyRelationType,
          marriageDate: fam.type === FamilyRelationType.SPOUSE && fam.marriageDate ? new Date(fam.marriageDate) : undefined,
        });
      }
    }
    // Busca membro com departamentos
    return this.findOne(member.id);
  }

  async update(id: string, data: UpdateMemberDto): Promise<MemberResponseDto> {
    await this.findOne(id); // Garante existência
    let updateData: any = { ...data };
    if (data.birthDate) {
      updateData.birthDate = new Date(data.birthDate);
    }
    const updated = await this.memberRepository.update(id, updateData);
    // Atualiza departamentos se enviados
    if (data.departments) {
      // Remove antigos
      const oldLinks = await this.memberDepartmentRepository.findAll({ where: { memberId: id } });
      for (const link of oldLinks) {
        await this.memberDepartmentRepository.softDelete(link.id);
      }
      // Cria novos
      for (const dep of data.departments) {
        await this.memberDepartmentRepository.create({
          memberId: id,
          departmentId: dep.departmentId,
          isLeader: dep.isLeader,
        });
      }
    }
    // Atualiza relações familiares se enviados
    if (data.family) {
      // Remove antigas
      const oldFam = await this.memberFamilyRepository.findAll({ where: { memberId: id } });
      for (const link of oldFam) {
        await this.memberFamilyRepository.softDelete(link.id);
      }
      // Cria novas
      for (const fam of data.family) {
        await this.memberFamilyRepository.create({
          memberId: id,
          relatedMemberId: fam.id,
          relation: fam.type as FamilyRelationType,
          marriageDate: fam.type === FamilyRelationType.SPOUSE && fam.marriageDate ? new Date(fam.marriageDate) : undefined,
        });
      }
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.memberRepository.softDelete(id);
  }

  private toMemberResponseDto(member: Member, families?: any[]): MemberResponseDto {
    const departments: MemberDepartmentDto[] = (member.memberDepartments || []).map(md => ({
      id: md.department?.id,
      name: md.department?.name,
    }));
    const family: MemberFamilyResponseDto[] = (families || []).map(fam => ({
      id: fam.relatedMember?.id,
      idMember: fam.relatedMember?.idMember,
      name: fam.relatedMember?.name,
      relationType: fam.relation,
    }));
    return {
      id: member.id,
      idMember: member.idMember,
      name: member.name,
      email: member.email,
      phone: member.phone,
      departments,
      baptismStatus: !!member.baptismStatus,
      createdAt: member.createdAt,
      family,
    };
  }
}
