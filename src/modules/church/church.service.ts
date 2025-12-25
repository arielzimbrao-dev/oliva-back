import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterChurchRequestDto } from './dtos/register-church-request.dto';
import { RegisterChurchResponseDto } from '../auth/dtos/register-church-response.dto';
import { ChurchRepository } from '../../entities/repository/church.repository';
import { UserRepository } from '../../entities/repository/user.repository';
import { RoleRepository } from '../../entities/repository/role.repository';
import { MemberRepository } from '../../entities/repository/member.repository';
import { PlanRepository } from '../../entities/repository/plan.entity';
import { ChurchSubscriptionRepository } from '../../entities/repository/church-subscription.repository';
import {
  EmailAlreadyInUseError,
  InvalidPlanError,
  AdminRoleNotFoundError,
  PasswordConfirmationMismatchError,
} from '../../common/exceptions/exception';
import { cryptoUtils } from 'src/common/util/crypto.utils';

@Injectable()
export class ChurchService {
  constructor(
    private readonly churchRepo: ChurchRepository,
    private readonly userRepo: UserRepository,
    private readonly roleRepo: RoleRepository,
    private readonly memberRepo: MemberRepository,
    private readonly planRepo: PlanRepository,
    private readonly subscriptionRepo: ChurchSubscriptionRepository,
  ) {}

  async registerChurch(dto: RegisterChurchRequestDto): Promise<RegisterChurchResponseDto> {
    const { credentials, profile, plan: planDto } = dto;

    const existing = await this.userRepo.findOne({ where: { email: credentials.email } } as any);
    if (existing) throw new EmailAlreadyInUseError();

    const plan = await this.planRepo.findOne({ where: { id: planDto.planId } } as any);
    if (!plan) throw new InvalidPlanError();

    const adminRole = await this.roleRepo.findBySlug('ADMIN');
    if (!adminRole) throw new AdminRoleNotFoundError();

    const addr = profile.address
      ? [profile.address.street, profile.address.number, profile.address.city, profile.address.state, profile.address.country, profile.address.postalCode]
          .filter(Boolean)
          .join(', ')
      : undefined;

    const church = await this.churchRepo.create({
      name: profile.name,
      address: addr,
      email: credentials.email,
      status: 'ACTIVE',
    });

    if (credentials.password !== credentials.passwordConfirmation) {
      throw new PasswordConfirmationMismatchError();
    }
    const decrypto = cryptoUtils.decryptoPasswordFront(credentials.password);
    const pass = await cryptoUtils.preSavePassword(decrypto);

    const user = await this.userRepo.create({
      email: credentials.email,
      password: pass,
      role: adminRole,
      state: 'ACTIVE',
      churchId: (church as any).id,
    });

    await this.memberRepo.create({
      name: profile.fullName,
      birthDate: profile.birthDate ? new Date(profile.birthDate) : undefined,
      phone: profile.phone,
      status: 'ACTIVE',
      baptismStatus: profile.baptized || false,
      church: church as any,
      user: user as any,
    } as any);

    const now = new Date();
    const amount = profile.preferredCurrency === 'USD' ? (plan as any).amountDolar :
            profile.preferredCurrency === 'EUR' ? (plan as any).amountEuro :
            profile.preferredCurrency === 'BRL' ? (plan as any).amountReal :
            (plan as any).amountDolar;

    await this.subscriptionRepo.create({
      church: church as any,
      plan: plan as any,
      amount: amount,
      currency: profile.preferredCurrency,
      startDate: now,
      endDate: (plan as any).freeDays && (plan as any).freeDays > 0 ? new Date(now.getTime() + (plan as any).freeDays * 24 * 60 * 60 * 1000) : undefined,
    } as any);

    return {
      id: (church as any).id,
      name: church.name,
      email: church.email,
      status: church.status,
      createdAt: (church as any).createdAt,
      updatedAt: (church as any).updatedAt,
    };
  }
}
