  
import { Inject, Injectable } from '@nestjs/common';
import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { Department } from '../department.entity';
import { BaseRepository } from '../../common/repository/base.repository';

@Injectable()
export class DepartmentRepository {
  private base: BaseRepository<Department>;

  constructor(
    @Inject('DEPARTMENT_REPOSITORY')
    private readonly departmentRepository: Repository<Department>,
  ) {
    this.base = new BaseRepository<Department>(this.departmentRepository);
  }

  findAll(options?: FindManyOptions<Department>) {
    return this.base.findAll(options);
  }

  async findOneByIdAndChurch(id: string, churchId: string) {
    // Use IsNull() for deletedAt to match TypeORM's expected type
    return this.departmentRepository.findOne({ where: { id, churchId, deletedAt: require('typeorm').IsNull() } });
  }

  async findPaginated({ page = 1, limit = 10, filter = '', churchId }: { page?: number; limit?: number; filter?: string; churchId: string }) {
    const skip = (page - 1) * limit;
    const query = this.departmentRepository.createQueryBuilder('department')
      .leftJoinAndSelect('department.memberDepartments', 'memberDepartment')
      .where('department.deletedAt IS NULL')
      .andWhere('department.churchId = :churchId', { churchId });
    if (filter) {
      query.andWhere('department.name ILIKE :filter OR department.description ILIKE :filter', { filter: `%${filter}%` });
    }
    query.orderBy('department.updatedAt', 'DESC');
    query.skip(skip).take(limit);
    const [departments, total] = await query.getManyAndCount();

    // Contagem total de membros e líderes
    let totalMember = 0;
    let totalLider = 0;
    const data = departments.map((dep) => {
      const totalMemberDep = dep.memberDepartments ? dep.memberDepartments.length : 0;
      const totalLiderDep = dep.memberDepartments ? dep.memberDepartments.filter(md => md.isLeader).length : 0;
      totalMember += totalMemberDep;
      totalLider += totalLiderDep;
      return {
        ...dep,
        totalMember: totalMemberDep,
      };
    });

    return {
      total,
      totalMember,
      totalLider,
      data,
    };
  }

  findOne(options: FindOneOptions<Department>) {
    return this.base.findOne(options);
  }

  findOneById(id: string) {
    return this.base.findOneById(id);
  }

  create(entity: Partial<Department>) {
    return this.base.create(entity);
  }

  save(entity: Department) {
    return this.base.save(entity);
  }

  update(id: string, partial: Partial<Department>) {
    return this.base.update(id, partial);
  }

  softDelete(id: string) {
    return this.base.softDelete(id);
  }
}
