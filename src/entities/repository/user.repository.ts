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

  async findPaginated({ page = 1, limit = 10, filter = '', churchId }: { page?: number; limit?: number; filter?: string; churchId: string }) {
    const skip = (page - 1) * limit;
    const query = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.members', 'member')
      .where('user.deletedAt IS NULL')
      .andWhere('user.churchId = :churchId', { churchId });
    if (filter) {
      query.andWhere('user.email ILIKE :filter OR user.state ILIKE :filter OR member.name ILIKE :filter', { filter: `%${filter}%` });
    }
    query.orderBy('user.updatedAt', 'DESC');
    query.skip(skip).take(limit);
    const [users, total] = await query.getManyAndCount();
    return { users, total };
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

  findByEmail(email: string, relations?: string[]) {
    return this.base.findOne({
      where: { email },
      relations
    } as any);
  }

  findByEmailWithRelations(email: string) {
    return this.base.findOne({
      where: { email },
      relations: ['members', 'church', 'role']
    } as any);
  }

  findByIdWithRelations(id: string) {
    return this.base.findOne({
      where: { id },
      relations: ['members', 'church', 'role']
    } as any);
  }
}