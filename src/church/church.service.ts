import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterChurchDto, RegisterChurchResultDto } from '../auth/dtos/register-church.dto';
import { Plan } from '../entities/plan.entity';
import { Church } from '../entities/church.entity';
import { User } from '../entities/user.entity';
import { Member } from '../entities/member.entity';
import { ChurchSubscription } from '../entities/church-subscription.entity';

@Injectable()
export class ChurchService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async registerChurch(dto: RegisterChurchDto): Promise<RegisterChurchResultDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { credentials, profile, church: churchDto, plan: planDto } = dto;

      const existing = await queryRunner.manager.findOne(User, { where: { email: credentials.email } });
      if (existing) throw new BadRequestException('Email already in use');

      const plan = await queryRunner.manager.findOne(Plan, { where: { id: planDto.planId } });
      if (!plan) throw new BadRequestException('Invalid plan');

      const addr = churchDto.address
        ? [churchDto.address.street, churchDto.address.number, churchDto.address.city, churchDto.address.state, churchDto.address.country, churchDto.address.postalCode]
            .filter(Boolean)
            .join(', ')
        : undefined;

      const church = queryRunner.manager.create(Church, {
        name: churchDto.name,
        address: addr,
        email: credentials.email,
        status: 'ACTIVE',
      });
      const savedChurch = await queryRunner.manager.save(Church, church);

      if (credentials.password !== credentials.passwordConfirmation) {
        throw new BadRequestException('Password confirmation does not match');
      }
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(credentials.password, salt);

      const user = queryRunner.manager.create(User, {
        email: credentials.email,
        password: hashed,
        role: 'ADMIN',
        state: 'ACTIVE',
        church: savedChurch,
      });
      const savedUser = await queryRunner.manager.save(User, user);

      const member = queryRunner.manager.create(Member, {
        name: profile.fullName,
        birthDate: profile.birthDate ? new Date(profile.birthDate) : undefined,
        phone: profile.phone,
        status: 'ACTIVE',
        baptismStatus: profile.baptized ? 'COMPLETED' : 'PENDING',
        church: savedChurch,
        user: savedUser,
      });
      const savedMember = await queryRunner.manager.save(Member, member);

      const now = new Date();
      const amount = churchDto.preferredCurrency === 'USD' ? plan.amountDolar :
                    churchDto.preferredCurrency === 'EUR' ? plan.amountEuro :
                    churchDto.preferredCurrency === 'BRL' ? plan.amountReal :
                    plan.amountDolar;
      const subscription = queryRunner.manager.create(ChurchSubscription, {
        church: savedChurch,
        plan: plan,
        amount: amount,
        currency: churchDto.preferredCurrency,
        startDate: now,
        endDate: plan.freeDays && plan.freeDays > 0 ? new Date(now.getTime() + plan.freeDays * 24 * 60 * 60 * 1000) : undefined,
      });
      const savedSubscription = await queryRunner.manager.save(ChurchSubscription, subscription);

      const payload = { sub: savedUser.id, email: savedUser.email, churchId: savedChurch.id, role: savedUser.role };

      const accessToken = this.jwtService.sign(payload, { algorithm: 'RS256', expiresIn: '15m' });
      const refreshToken = this.jwtService.sign(payload, { algorithm: 'RS256', expiresIn: '7d' });

      await queryRunner.commitTransaction();

      return {
        accessToken,
        refreshToken,
        user: savedUser,
        member: savedMember,
        church: savedChurch,
        subscription: savedSubscription,
      } as RegisterChurchResultDto;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
