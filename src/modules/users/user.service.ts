import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { UserResponseDto, UserListResponseDto, MemberResponseDto, MemberDepartmentResponseDto } from './dtos/user-response.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { UserRepository } from '../../entities/repository/user.repository';
import { RoleRepository } from '../../entities/repository/role.repository';
import { MemberRepository } from '../../entities/repository/member.repository';
import { MemberDepartmentRepository } from '../../entities/repository/member-department.repository';
import { UserNotFoundError, EmailAlreadyInUseError, RoleNotFoundError } from '../../common/exceptions/exception';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly memberRepository: MemberRepository,
    private readonly memberDepartmentRepository: MemberDepartmentRepository,
  ) {}

  async listUsers({ page = 1, limit = 10, filter = '', churchId }: { page?: number; limit?: number; filter?: string; churchId: string }): Promise<UserListResponseDto> {
    const { users, total } = await this.userRepository.findPaginated({ page, limit, filter, churchId });
    return {
      total,
      page,
      limit,
      data: users.map((user) => this.toUserResponseDto(user)),
    };
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOneById(id);
    if (!user) {
      throw new UserNotFoundError();
    }
    return this.toUserResponseDto(user);
  }

  async createUser(email: string, password: string, roleSlug: string, churchId: string, memberData?: any): Promise<UserResponseDto> {
    const existing = await this.userRepository.findOne({ where: { email } } as any);
    if (existing) {
      throw new EmailAlreadyInUseError();
    }

    const role = await this.roleRepository.findBySlug(roleSlug);
    if (!role) {
      throw new RoleNotFoundError();
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await this.userRepository.create({
      email,
      password: hashed,
      roleId: role.id,
      state: 'ACTIVE',
      churchId,
    });

    let member: any = null;
    if (memberData) {
      member = await this.memberRepository.create({
        ...memberData,
        churchId,
        userId: user.id,
        status: 'ACTIVE',
      });
      if (Array.isArray(memberData.departments)) {
        for (const dep of memberData.departments) {
          await this.memberDepartmentRepository.create({
            memberId: member.id,
            departmentId: dep.departmentId,
            isLeader: !!dep.isLeader,
          });
        }
      }
    }
    return this.toUserResponseDto({ ...user, member });
  }

  async updateUser(id: string, updates: { email?: string; state?: string; roleSlug?: string; member?: any }): Promise<UserResponseDto> {
    // Busca a entidade User real, não o DTO
    const user = await this.userRepository.findOneById(id);
    if (!user) {
      throw new UserNotFoundError();
    }

    if (updates.email && updates.email !== user.email) {
      const existing = await this.userRepository.findOne({ where: { email: updates.email } } as any);
      if (existing) {
        throw new EmailAlreadyInUseError();
      }
      user.email = updates.email;
    }

    if (updates.state) {
      user.state = updates.state;
    }

    if (updates.roleSlug) {
      const role = await this.roleRepository.findBySlug(updates.roleSlug);
      if (!role) {
        throw new RoleNotFoundError();
      }
      user.roleId = role.id;
    }

    // Atualiza departamentos do membro se enviados
    if (updates.member && Array.isArray(updates.member.departments)) {
      // Busca o membro vinculado ao usuário
      const member = await this.memberRepository.findOne({ where: { userId: user.id } });
      if (member) {
        // Remove todos os vínculos antigos
        const oldLinks = await this.memberDepartmentRepository.findAll({ where: { memberId: member.id } });
        for (const link of oldLinks) {
          await this.memberDepartmentRepository.softDelete(link.id);
        }
        // Cria os novos vínculos
        for (const dep of updates.member.departments) {
          await this.memberDepartmentRepository.create({
            memberId: member.id,
            departmentId: dep.departmentId,
            isLeader: !!dep.isLeader,
          });
        }
      }
    }

    const updatedUser = await this.userRepository.save(user as any);
    // Busca membro atualizado
    const member = await this.memberRepository.findOne({ where: { userId: updatedUser.id } });
    return this.toUserResponseDto({ ...updatedUser, member });
  }

  private toUserResponseDto(user: any): UserResponseDto {
    const member = user.member || (user.members && user.members[0]);
    let departments: MemberDepartmentResponseDto[] = [];
    if (member && member.memberDepartments) {
      departments = member.memberDepartments.map((md: any) => ({
        departmentId: md.departmentId,
        isLeader: md.isLeader,
      }));
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role?.slug || '',
      state: user.state,
      churchId: user.churchId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      member: member
        ? {
            id: member.id,
            name: member.name,
            email: member.email,
            phone: member.phone,
            birthDate: member.birthDate,
            baptismStatus: member.baptismStatus,
            status: member.status,
            departments,
          }
        : undefined,
    };
  }

  async deleteUser(id: string) {
    return await this.userRepository.softDelete(id);
  }
}
