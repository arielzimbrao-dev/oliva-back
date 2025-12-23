import { Inject, Injectable } from "@nestjs/common";
import { Repository, FindOneOptions, FindManyOptions } from "typeorm";
import { Role } from "../role.entity";
import { BaseRepository } from "../../common/repository/base.repository";

@Injectable()
export class RoleRepository {
  private base: BaseRepository<Role>;

  constructor(
    @Inject('ROLE_REPOSITORY')
    private readonly roleRepository: Repository<Role>,
  ) {
    this.base = new BaseRepository<Role>(this.roleRepository);
  }

  findAll(options?: FindManyOptions<Role>) {
    return this.base.findAll(options);
  }

  findOne(options: FindOneOptions<Role>) {
    return this.base.findOne(options);
  }

  findOneById(id: string) {
    return this.base.findOneById(id);
  }

  findBySlug(slug: string) {
    return this.base.findOne({ where: { slug } as any });
  }

  create(entity: Partial<Role>) {
    return this.base.create(entity);
  }

  save(entity: Role) {
    return this.base.save(entity);
  }

  update(id: string, partial: Partial<Role>) {
    return this.base.update(id, partial);
  }

  softDelete(id: string) {
    return this.base.softDelete(id);
  }
}