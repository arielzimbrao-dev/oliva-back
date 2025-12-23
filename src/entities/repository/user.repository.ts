import { Inject, Injectable } from "@nestjs/common";
import { Repository, FindManyOptions, FindOneOptions } from "typeorm";
import { User } from "../user.entity";
import { BaseRepository } from "../../common/repository/base.repository";

@Injectable()
export class UserRepository {
  private base: BaseRepository<User>;

  constructor(
    @Inject('USER_REPOSITORY')
    private readonly userRepository: Repository<User>,
  ) {
    this.base = new BaseRepository<User>(this.userRepository);
  }

  findAll(options?: FindManyOptions<User>) {
    return this.base.findAll(options);
  }

  findOne(options: FindOneOptions<User>) {
    return this.base.findOne(options);
  }

  findOneById(id: string) {
    return this.base.findOneById(id);
  }

  create(entity: Partial<User>) {
    return this.base.create(entity);
  }

  save(entity: User) {
    return this.base.save(entity);
  }

  update(id: string, partial: Partial<User>) {
    return this.base.update(id, partial);
  }

  softDelete(id: string) {
    return this.base.softDelete(id);
  }
}