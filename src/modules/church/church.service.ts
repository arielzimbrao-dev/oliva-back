import { UpdateChurchDto } from './dtos/update-church.dto';
import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterChurchRequestDto } from './dtos/register-church-request.dto';
import { RegisterChurchResponseDto } from '../auth/dtos/register-church-response.dto';
import { ChurchInfoResponseDto } from './dtos/church-info-response.dto';
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
  ) { }

  async getChurchInfo(churchId: string): Promise<ChurchInfoResponseDto> {
    // Busca dados da igreja
    const church = await this.churchRepo.findOneById(churchId);
    if (!church) throw new Error('Igreja não encontrada');

    // Busca o plano selecionado (última subscription ativa)
    let planName: string | undefined = undefined;
    let memberLimit: number | undefined = undefined;
    let planId: string | undefined = undefined;
    // Busca a subscription mais recente
    const subscriptions = church.subscriptions || [];
    let lastSubscription = subscriptions.length > 0 ? subscriptions[subscriptions.length - 1] : undefined;
    if (!lastSubscription && church.currentSubscriptionPlan) lastSubscription = church.currentSubscriptionPlan;
    if (lastSubscription && lastSubscription.planId) {
      planId = lastSubscription.planId;
    }
    if (planId) {
      const plan = await this.planRepo.findOneById(planId);
      if (plan) {
        planName = plan.name;
        memberLimit = plan.memberLimit;
      }
    }

    // Busca total de membros cadastrados (ativos)
    const totalMembers = await this.memberRepo.countByChurchAndStatus(churchId, 'ACTIVE');

    return {
      name: church.name,
      language: church.preferredLanguage ?? '',
      currency: church.preferredCurrency ?? '',
      plan: planName,
      totalMembers,
      memberLimit,
    };
  }

  async registerChurch(dto: RegisterChurchRequestDto): Promise<RegisterChurchResponseDto> {
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
      foundationDate: churchDto.foundationDate,
      preferredLanguage: churchDto.preferredLanguage,
      preferredCurrency: churchDto.preferredCurrency,
    });

    if (credentials.password !== credentials.passwordConfirmation) {
      throw new PasswordConfirmationMismatchError();
    }

    const pass = await cryptoUtils.preSavePassword(credentials.password);

    const user = await this.userRepo.create({
      email: credentials.email,
      password: pass,
      role: adminRole,
      state: 'ACTIVE',
      churchId: (church as any).id,
    });

    // Busca e incrementa nextId da church para idMember
    const idMember = (church.nextId || 0) + 1;
    church.nextId = idMember;
    await this.churchRepo.save(church);
    await this.memberRepo.create({
      name: profile.fullName,
      birthDate: profile.birthDate ? new Date(profile.birthDate) : undefined,
      phone: profile.phone,
      status: 'ACTIVE',
      baptismStatus: profile.baptized || false,
      gender: profile.gender,
      church: church as any,
      user: user as any,
      idMember,
      churchId: (church as any).id,
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

    return {
      id: (church as any).id,
      name: church.name,
      email: church.email,
      status: church.status,
      createdAt: (church as any).createdAt,
      updatedAt: (church as any).updatedAt,
    };
  }

    async updateChurch(churchId: string, dto: UpdateChurchDto): Promise<ChurchInfoResponseDto> {
      const church = await this.churchRepo.findOneById(churchId);
      if (!church) throw new Error('Igreja não encontrada');
      if (dto.name !== undefined) church.name = dto.name;
      if (dto.preferredLanguage !== undefined) church.preferredLanguage = dto.preferredLanguage;
      if (dto.preferredCurrency !== undefined) church.preferredCurrency = dto.preferredCurrency;
      await this.churchRepo.save(church);
      return this.getChurchInfo(churchId);
    }
}
