import { Inject, Injectable } from "@nestjs/common";
import { Repository, FindOneOptions, FindManyOptions } from "typeorm";
import { Church } from "../church.entity";
import { BaseRepository } from "../../common/repository/base.repository";

@Injectable()
export class ChurchRepository {
  private base: BaseRepository<Church>;

  constructor(
    @Inject('CHURCH_REPOSITORY')
    private readonly churchRepository: Repository<Church>,
  ) {
    this.base = new BaseRepository<Church>(this.churchRepository);
  }

  findAll(options?: FindManyOptions<Church>) {
    return this.base.findAll(options);
  }

  findOne(options: FindOneOptions<Church>) {
    return this.base.findOne(options);
  }

  findOneById(id: string) {
    return this.base.findOneById(id);
  }

  findByEmail(email: string) {
    return this.base.findOne({ where: { email } as any });
  }

  create(entity: Partial<Church>) {
    return this.base.create(entity);
  }

  save(entity: Church) {
    return this.base.save(entity);
  }

  update(id: string, partial: Partial<Church>) {
    return this.base.update(id, partial);
  }

  softDelete(id: string) {
    return this.base.softDelete(id);
  }
}