import { Injectable, NotFoundException } from '@nestjs/common';
import { DepartmentRepository } from '../../entities/repository/department.repository';
import { Department } from '../../entities/department.entity';
import { CreateDepartmentDto } from './dtos/create-department.dto';
import { UpdateDepartmentDto } from './dtos/update-department.dto';
import { DepartmentResponseDto, DepartmentListResponseDto } from './dtos/department-response.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly departmentRepository: DepartmentRepository) {}

  async findAll({ churchId, page = 1, limit = 10, filter = '' }: { churchId: string; page?: number; limit?: number; filter?: string }): Promise<DepartmentListResponseDto> {
    const result = await this.departmentRepository.findPaginated({ churchId, page, limit, filter });
    return {
      total: result.total,
      totalMember: result.totalMember,
      totalLider: result.totalLider,
      data: result.data.map(dep => this.toDepartmentResponseDto(dep)),
    };
  }

  async findOne(id: string): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository.findOneById(id);
    if (!department) throw new NotFoundException('Department not found');
    return this.toDepartmentResponseDto(department);
  }

  async create(data: CreateDepartmentDto & { churchId: string }): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepository.create(data);
    return this.toDepartmentResponseDto(department);
  }

  async update(id: string, data: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    await this.findOne(id);
    const updated = await this.departmentRepository.update(id, data);
    return this.toDepartmentResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.departmentRepository.softDelete(id);
  }

  private toDepartmentResponseDto(dep: any): DepartmentResponseDto {
    return {
      id: dep.id,
      name: dep.name,
      description: dep.description,
      churchId: dep.churchId,
      totalMember: dep.totalMember ?? (dep.memberDepartments ? dep.memberDepartments.length : 0),
      createdAt: dep.createdAt,
      updatedAt: dep.updatedAt,
    };
  }
}
