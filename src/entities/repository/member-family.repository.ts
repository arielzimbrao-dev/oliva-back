import { Inject, Injectable } from '@nestjs/common';
import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { MemberFamily, FamilyRelationType } from '../member-family.entity';
import { BaseRepository } from '../../common/repository/base.repository';

@Injectable()
export class MemberFamilyRepository {
  private base: BaseRepository<MemberFamily>;

  constructor(
    @Inject('MEMBER_FAMILY_REPOSITORY')
    private readonly memberFamilyRepository: Repository<MemberFamily>,
  ) {
    this.base = new BaseRepository<MemberFamily>(this.memberFamilyRepository);
  }

  findAll(options?: FindManyOptions<MemberFamily>) {
    return this.base.findAll(options);
  }

  findOne(options: FindOneOptions<MemberFamily>) {
    return this.base.findOne(options);
  }

  findOneById(id: string) {
    return this.base.findOneById(id);
  }

  create(entity: Partial<MemberFamily>) {
    return this.base.create(entity);
  }

  save(entity: MemberFamily) {
    return this.base.save(entity);
  }

  update(id: string, partial: Partial<MemberFamily>) {
    return this.base.update(id, partial);
  }

  softDelete(id: string) {
    return this.base.softDelete(id);
  }

  async findByMemberIds(memberIds: string[]) {
    return this.memberFamilyRepository.find({
      where: memberIds.flatMap(id => [
        { member1Id: id },
        { member2Id: id }
      ]) as any
    });
  }

  async findByChurchId(churchId: string) {
    // MemberFamily não tem churchId diretamente, então precisamos filtrar após carregar
    return this.memberFamilyRepository.find({
      where: { 
        relation: FamilyRelationType.SPOUSE,
        deletedAt: undefined as any
      },
      relations: ['member', 'relatedMember']
    });
  }
}
