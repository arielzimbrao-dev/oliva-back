import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async listUsers() {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .select([
        'user.id',
        'user.email',
        'user.state',
        'user.updatedAt',
        'role.slug',
        'role.name',
      ])
      .where('user.deletedAt IS NULL')
      .orderBy('user.createdAt', 'DESC')
      .getMany();

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role?.slug || 'N/A',
      status: user.state,
      ultimaAtividade: user.updatedAt,
    }));
  }

  async getUserById(id: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.church', 'church')
      .where('user.id = :id', { id })
      .andWhere('user.deletedAt IS NULL')
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(email: string, password: string, roleSlug: string, churchId: string) {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const role = await this.roleRepository.findOne({ where: { slug: roleSlug } });
    if (!role) {
      throw new BadRequestException(`Role ${roleSlug} not found`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      email,
      password: hashed,
      role,
      state: 'ACTIVE',
      churchId,
    });

    return await this.userRepository.save(user);
  }

  async updateUser(id: string, updates: { email?: string; state?: string; roleSlug?: string }) {
    const user = await this.getUserById(id);

    if (updates.email && updates.email !== user.email) {
      const existing = await this.userRepository.findOne({ where: { email: updates.email } });
      if (existing) {
        throw new BadRequestException('Email already in use');
      }
      user.email = updates.email;
    }

    if (updates.state) {
      user.state = updates.state;
    }

    if (updates.roleSlug) {
      const role = await this.roleRepository.findOne({ where: { slug: updates.roleSlug } });
      if (!role) {
        throw new BadRequestException(`Role ${updates.roleSlug} not found`);
      }
      user.role = role;
    }

    return await this.userRepository.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.getUserById(id);
    user.deletedAt = new Date();
    return await this.userRepository.save(user);
  }
}
