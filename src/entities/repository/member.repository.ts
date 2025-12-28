import { IsNull } from 'typeorm';
import { Inject, Injectable } from "@nestjs/common";
import { Repository, FindOneOptions, FindManyOptions } from "typeorm";
import { Member } from "../member.entity";
import { BaseRepository } from "../../common/repository/base.repository";

@Injectable()
export class MemberRepository {
    async findOneByIdAndChurch(id: string, churchId: string) {
      return this.memberRepository.findOne({ where: { id, churchId, deletedAt: IsNull() } });
    }
  private base: BaseRepository<Member>;

  constructor(
    @Inject('MEMBER_REPOSITORY')
    private readonly memberRepository: Repository<Member>,
  ) {
    this.base = new BaseRepository<Member>(this.memberRepository);
  }

  findAll(options?: FindManyOptions<Member>) {
    return this.base.findAll(options);
  }

  findOne(options: FindOneOptions<Member>) {
    return this.base.findOne(options);
  }

  findOneById(id: string) {
    return this.base.findOneById(id);
  }

  create(entity: Partial<Member>) {
    return this.base.create(entity);
  }

  save(entity: Member) {
    return this.base.save(entity);
  }

  update(id: string, partial: Partial<Member>) {
    return this.base.update(id, partial);
  }

  softDelete(id: string) {
    return this.base.softDelete(id);
  }
}