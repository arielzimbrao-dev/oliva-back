import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterChurchDto } from '../auth/dtos/register-church.dto';
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

  async registerChurch(dto: RegisterChurchDto): Promise<void> {
    const { credentials, profile, church: churchDto, plan: planDto } = dto;

    const existing = await this.userRepo.findOne({ where: { email: credentials.email } } as any);
    if (existing) throw new EmailAlreadyInUseError();

    const plan = await this.planRepo.findOne({ where: { id: planDto.planId } } as any);
    if (!plan) throw new InvalidPlanError();

    const adminRole = await this.roleRepo.findBySlug('ADMIN');
    if (!adminRole) throw new AdminRoleNotFoundError();

    const addr = churchDto.address
      ? [churchDto.address.street, churchDto.address.number, churchDto.address.city, churchDto.address.state, churchDto.address.country, churchDto.address.postalCode]
          .filter(Boolean)
          .join(', ')
      : undefined;

    const church = await this.churchRepo.create({
      name: churchDto.name,
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
    const amount = churchDto.preferredCurrency === 'USD' ? (plan as any).amountDolar :
                  churchDto.preferredCurrency === 'EUR' ? (plan as any).amountEuro :
                  churchDto.preferredCurrency === 'BRL' ? (plan as any).amountReal :
                  (plan as any).amountDolar;

    await this.subscriptionRepo.create({
      church: church as any,
      plan: plan as any,
      amount: amount,
      currency: churchDto.preferredCurrency,
      startDate: now,
      endDate: (plan as any).freeDays && (plan as any).freeDays > 0 ? new Date(now.getTime() + (plan as any).freeDays * 24 * 60 * 60 * 1000) : undefined,
    } as any);

    return;
  }
}
