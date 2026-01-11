import { Injectable, NotFoundException } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { MemberRepository } from '../../entities/repository/member.repository';
import { DepartmentRepository } from '../../entities/repository/department.repository';
import { Member } from '../../entities/member.entity';
import { CreateMemberDto } from '../users/dtos/create-member.dto';
import { UpdateMemberDto } from '../users/dtos/update-member.dto';
import { MemberResponseDto, MemberListResponseDto, MemberDepartmentDto, MemberFamilyResponseDto } from './dtos/member-response.dto';
import { MemberEventsResponseDto, EventDto, MemberInfoDto } from './dtos/member-events-response.dto';
import { MemberStatsResponseDto } from './dtos/member-stats-response.dto';
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

  async findOne(id: string, churchId: string): Promise<MemberResponseDto> {
    const member = await this.memberRepository.findOne({
      where: { id, churchId, deletedAt: IsNull() },
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
    // Busca igreja e plano
    const church = await this.churchRepository.findOneById(data.churchId);
    if (!church) throw new NotFoundException('Church not found');
    let memberLimit = 99999999;
    if (church.currentSubscriptionPlan && church.currentSubscriptionPlan.plan) {
      memberLimit = church.currentSubscriptionPlan.plan.memberLimit ?? 99999999;
    }
    // Conta membros ativos
    const activeMembers = await this.memberRepository.countByChurchAndStatus(data.churchId, 'ACTIVE');
    if (activeMembers >= memberLimit) {
      throw new NotFoundException('Limite de membros atingido para esta igreja.');
    }
    // Busca e incrementa nextId da church
    const idMember = (church.nextId || 0) + 1;
    church.nextId = idMember;
    await this.churchRepository.save(church);
    // Cria membro com idMember
    const member = await this.memberRepository.create({
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      idMember,
      gender: data.sex,
      status: 'ACTIVE',
    });
    // Associa departamentos se enviados
    if (data.departmentIds && data.departmentIds.length) {
      for (const dep of data.departmentIds) {
        await this.memberDepartmentRepository.create({
          memberId: member.id,
          departmentId: dep.id,
          isLeader: dep.isLeader || false,
        });
      }
    }
    // Associa relações familiares se enviadas
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
    return this.findOne(member.id, data.churchId);
  }

  async update(id: string, data: UpdateMemberDto & { churchId: string }): Promise<MemberResponseDto> {
    await this.findOne(id, data.churchId); // Garante existência
    let updateData: any = {};
    if (data.birthDate) {
      updateData.birthDate = new Date(data.birthDate);
    }
    if (data.sex) {
      updateData.gender = data.sex;
    }
    if (data.email) updateData.email = data.email;
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.baptismStatus !== undefined) updateData.baptismStatus = data.baptismStatus;
    const updated = await this.memberRepository.update(id, updateData);
    // Atualiza departamentos se enviados
    if (data.departmentIds) {
      // Remove apenas os vínculos que não estão mais presentes
      const oldLinks = await this.memberDepartmentRepository.findAll({ where: { memberId: id } });
      const newIds = data.departmentIds.map(dep => dep.id);
      for (const link of oldLinks) {
        if (!newIds.includes(link.departmentId)) {
          await this.memberDepartmentRepository.softDelete(link.id);
        }
      }
      // Cria novos vínculos para departamentos que não existem ainda
      for (const dep of data.departmentIds) {
        const existingLink = oldLinks.find(link => link.departmentId === dep.id);
        if (!existingLink) {
          await this.memberDepartmentRepository.create({
            memberId: id,
            departmentId: dep.id,
            isLeader: dep.isLeader,
          });
        } else if (existingLink.isLeader !== dep.isLeader) {
          await this.memberDepartmentRepository.update(existingLink.id, {
            isLeader: dep.isLeader,
          });
        }
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
    return this.findOne(id, data.churchId);
  }

  async remove(id: string, churchId: string): Promise<void> {
    await this.findOne(id, churchId);
    await this.memberRepository.softDelete(id);
  }

  private toMemberResponseDto(member: Member, families?: any[]): MemberResponseDto {
    const departments: MemberDepartmentDto[] = (member.memberDepartments || []).map(md => ({
      id: md.department?.id,
      name: md.department?.name,
      isLeader: md.isLeader,
        color: md.department?.color,
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
      gender: member.gender,
      birthDate: member.birthDate
        ? (member.birthDate instanceof Date
            ? member.birthDate.toISOString().split('T')[0]
            : typeof member.birthDate === 'string'
              ? member.birthDate
              : undefined)
        : undefined,
      departments,
      baptismStatus: !!member.baptismStatus,
      createdAt: member.createdAt,
      family,
    };
  }

  async findEvents(churchId: string, startDate: string, endDate: string): Promise<MemberEventsResponseDto> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Busca todos os membros ativos da igreja
    const members = await this.memberRepository['memberRepository'].find({
      where: { churchId, status: 'ACTIVE', deletedAt: IsNull() },
      select: ['id', 'idMember', 'name', 'birthDate'],
    });

    // Busca todas as relações de casamento da igreja
    const marriages = await this.memberFamilyRepository['memberFamilyRepository'].find({
      where: { 
        relation: FamilyRelationType.SPOUSE, 
        deletedAt: IsNull() 
      },
      relations: ['member', 'relatedMember'],
    });

    const birthdays: EventDto[] = [];
    const marriagesEvents: EventDto[] = [];

    // Filtrar aniversários
    for (const member of members) {
      if (member.birthDate) {
        const birthDate = new Date(member.birthDate);
        if (this.isDateInRange(birthDate, start, end)) {
          birthdays.push({
            title: member.name,
            date: birthDate.toISOString().split('T')[0],
            members: [{
              id: member.id,
              name: member.name,
            }],
          });
        }
      }
    }

    // Filtrar aniversários de casamento (apenas da igreja específica)
    const processedPairs = new Set<string>();
    for (const marriage of marriages) {
      if (marriage.marriageDate && marriage.member?.churchId === churchId) {
        const pairKey = [marriage.memberId, marriage.relatedMemberId].sort().join('-');
        
        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey);
          const marriageDate = new Date(marriage.marriageDate);
          
          if (this.isDateInRange(marriageDate, start, end)) {
            marriagesEvents.push({
              title: `${marriage.member.name} & ${marriage.relatedMember.name}`,
              date: marriageDate.toISOString().split('T')[0],
              members: [
                {
                  id: marriage.member.id,
                  name: marriage.member.name,
                },
                {
                  id: marriage.relatedMember.id,
                  name: marriage.relatedMember.name,
                },
              ],
            });
          }
        }
      }
    }

    return {
      birthdays: birthdays.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      marriages: marriagesEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };
  }

  private isDateInRange(date: Date, start: Date, end: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const startMonth = start.getMonth() + 1;
    const startDay = start.getDate();
    const endMonth = end.getMonth() + 1;
    const endDay = end.getDate();

    // Cria datas fictícias no mesmo ano para comparação
    const eventDate = new Date(2000, month - 1, day);
    const rangeStart = new Date(2000, startMonth - 1, startDay);
    const rangeEnd = new Date(2000, endMonth - 1, endDay);

    // Se o intervalo atravessa o ano (ex: Dez 15 a Jan 15)
    if (rangeStart > rangeEnd) {
      return eventDate >= rangeStart || eventDate <= rangeEnd;
    }
    
    return eventDate >= rangeStart && eventDate <= rangeEnd;
  }

  async getStats(churchId: string, startDate: string, endDate: string): Promise<MemberStatsResponseDto> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Total de membros ativos
    const totalMembers = await this.memberRepository.countByChurchAndStatus(churchId, 'ACTIVE');

    // Buscar todos os membros ativos para análise
    const allMembers = await this.memberRepository['memberRepository'].find({
      where: { churchId, status: 'ACTIVE', deletedAt: IsNull() },
      relations: ['memberDepartments'],
    });

    // Novos membros (criados no período)
    const newMembers = allMembers.filter(m => {
      const createdDate = new Date(m.createdAt);
      return createdDate >= start && createdDate <= end;
    }).length;

    // Membros servindo (têm pelo menos um departamento ativo)
    const servingMembers = allMembers.filter(m => 
      m.memberDepartments && m.memberDepartments.length > 0
    ).length;

    // Novos membros servindo (departamentos criados no período)
    const memberDepartments = await this.memberDepartmentRepository['memberDepartmentRepository'].find({
      where: { deletedAt: IsNull() },
      relations: ['member'],
    });

    const newServingMembers = memberDepartments.filter(md => {
      const createdDate = new Date(md.createdAt);
      return md.member?.churchId === churchId && 
             md.member?.status === 'ACTIVE' &&
             createdDate >= start && 
             createdDate <= end;
    }).length;

    // Membros batizados e não batizados
    const baptizedMembers = allMembers.filter(m => m.baptismStatus === true).length;
    const notBaptizedMembers = allMembers.filter(m => m.baptismStatus === false).length;

    // Novos batizados (updatedAt no período e baptismStatus true)
    // Nota: Isso é uma aproximação. Para ser mais preciso, seria necessário um histórico de mudanças
    const newBaptizedMembers = allMembers.filter(m => {
      if (!m.baptismStatus) return false;
      const updatedDate = new Date(m.updatedAt);
      const createdDate = new Date(m.createdAt);
      // Considera como novo batizado se foi atualizado no período e não foi criado no mesmo período
      return updatedDate >= start && 
             updatedDate <= end && 
             (updatedDate.getTime() - createdDate.getTime()) > 1000; // Diferença maior que 1 segundo
    }).length;

    return {
      totalMembers,
      newMembers,
      servingMembers,
      newServingMembers,
      baptizedMembers,
      notBaptizedMembers,
      newBaptizedMembers,
    };
  }
}
