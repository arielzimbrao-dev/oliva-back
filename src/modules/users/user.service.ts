import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { UserRepository } from '../../entities/repository/user.repository';
import { RoleRepository } from '../../entities/repository/role.repository';
import { UserNotFoundError, EmailAlreadyInUseError } from '../../common/exceptions/exception';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async listUsers() {
    const users = await this.userRepository.findAll();

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role?.slug || 'N/A',
      status: user.state,
      ultimaAtividade: user.updatedAt,
    }));
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOneById(id);

    if (!user) {
      throw new UserNotFoundError();
    }

    return user;
  }

  async createUser(email: string, password: string, roleSlug: string, churchId: string) {
    const existing = await this.userRepository.findOne({ where: { email } } as any);
    if (existing) {
      throw new EmailAlreadyInUseError();
    }

    const role = await this.roleRepository.findBySlug(roleSlug);
    if (!role) {
      throw new BadRequestException(`role_not_found`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await this.userRepository.create({
      email,
      password: hashed,
      role,
      state: 'ACTIVE',
      churchId,
    });

    return user;
  }

  async updateUser(id: string, updates: { email?: string; state?: string; roleSlug?: string }) {
    const user = await this.getUserById(id);

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
        throw new BadRequestException(`role_not_found`);
      }
      user.role = role;
    }

    return await this.userRepository.save(user);
  }

  async deleteUser(id: string) {
    return await this.userRepository.softDelete(id);
  }
}
