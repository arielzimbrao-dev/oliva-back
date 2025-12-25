import { Inject, Injectable } from '@nestjs/common';
import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';
import { MemberDepartment } from '../member-department.entity';
import { BaseRepository } from '../../common/repository/base.repository';

@Injectable()
export class MemberDepartmentRepository {
  private base: BaseRepository<MemberDepartment>;

  constructor(
    @Inject('MEMBER_DEPARTMENT_REPOSITORY')
    private readonly memberDepartmentRepository: Repository<MemberDepartment>,
  ) {
    this.base = new BaseRepository<MemberDepartment>(this.memberDepartmentRepository);
  }

  findAll(options?: FindManyOptions<MemberDepartment>) {
    return this.base.findAll(options);
  }

  findOne(options: FindOneOptions<MemberDepartment>) {
    return this.base.findOne(options);
  }

  findOneById(id: string) {
    return this.base.findOneById(id);
  }

  create(entity: Partial<MemberDepartment>) {
    return this.base.create(entity);
  }

  save(entity: MemberDepartment) {
    return this.base.save(entity);
  }

  update(id: string, partial: Partial<MemberDepartment>) {
    return this.base.update(id, partial);
  }

  softDelete(id: string) {
    return this.base.softDelete(id);
  }
}
