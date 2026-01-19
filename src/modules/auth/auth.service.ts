import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../entities/repository/user.repository';
import { ChurchRepository } from '../../entities/repository/church.repository';
import { ChurchSubscriptionRepository } from '../../entities/repository/church-subscription.repository';
import { cryptoUtils } from 'src/common/util/crypto.utils';
import { LoginResponseDto } from './dtos/login-response.dto';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import { UserNotFoundError, UserInactiveError, InvalidTokenError, TokenExpiredError } from '../../common/exceptions/exception';

@Injectable()
export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private churchRepo: ChurchRepository,
    private churchSubscriptionRepo: ChurchSubscriptionRepository,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.userRepo.findOne({ where: { email }, relations: ['members', 'church', 'role'] } as any);
    if (!user) throw new UnauthorizedException();

    const ok = await cryptoUtils.compare(password, user.password);
    if (!ok) throw new UnauthorizedException();

    // Verificar se é o primeiro login da igreja (church.lastLoginTs === null && user é ADMIN)
    const isAdmin = user.role?.slug === 'ADMIN';
    const firstLogin = isAdmin && !user.church?.lastLoginTs;

    // Buscar subscription status (apenas para admin)
    let subscriptionStatus: 'trial' | 'active' | 'failed' | null = null;
    if (isAdmin) {
      const subscription = await this.churchSubscriptionRepo.findOne({
        where: { churchId: user.churchId },
        relations: ['plan'],
        order: { createdAt: 'DESC' }
      } as any);

      if (subscription) {
        // Trial é identificado pelo plano "Trial" (amountDolar = 0.00)
        const isTrial = subscription.plan?.name === 'Trial' || Number(subscription.amount) === 0;
        
        if (isTrial) {
          subscriptionStatus = 'trial';
        } else if (subscription.status === 'active') {
          subscriptionStatus = 'active';
        } else if (subscription.status === 'past_due') {
          subscriptionStatus = 'failed';
        }
      }
    }

    // Atualizar lastLoginTs do usuário
    const now = new Date();
    await this.userRepo.update(user.id, { lastLoginTs: now });

    // Atualizar lastLoginTs da igreja
    await this.churchRepo.update(user.churchId, { lastLoginTs: now });

    // Busca o nome do membro principal (primeiro membro associado ao user)
    const memberName = user.members && user.members.length > 0 ? user.members[0].name : undefined;
    // Busca o nome da igreja
    const churchName = user.church ? user.church.name : undefined;

    const payload = { sub: user.id, email: user.email, churchId: user.churchId, role: user.role ? { slug: user.role.slug, name: user.role.name } : undefined };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '60m' }),
      this.jwtService.signAsync(payload, { expiresIn: '24h' }),
    ]);

    return {
      accessToken,
      refreshToken,
      userId: user.id,
      email: user.email,
      role: user.role?.slug || '',
      churchId: user.churchId,
      memberName,
      churchName,
      firstLogin,
      subscriptionStatus,
    };
  }

  async refresh(refreshToken: string): Promise<LoginResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      // Busca o usuário novamente para garantir dados atualizados
      const user = await this.userRepo.findOne({ where: { id: payload.sub }, relations: ['members', 'church', 'role'] } as any);
      if (!user) throw new UnauthorizedException();
      const memberName = user.members && user.members.length > 0 ? user.members[0].name : undefined;
      const churchName = user.church ? user.church.name : undefined;
      const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, churchId: user.churchId, role: user.role ? { slug: user.role.slug, name: user.role.name } : undefined }, { expiresIn: '15m' });
      return {
        accessToken,
        refreshToken,
        userId: user.id,
        email: user.email,
        role: user.role?.slug || '',
        churchId: user.churchId,
        memberName,
        churchName,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    // Buscar usuário pelo email com suas relações
    const user = await this.userRepo.findOne({ 
      where: { email }, 
      relations: ['members', 'church'] 
    } as any);

    if (!user) {
      throw new UserNotFoundError();
    }

    // Verificar se o usuário está ativo
    if (user.state !== 'ACTIVE') {
      throw new UserInactiveError();
    }

    // Obter nome do membro (primeiro membro associado)
    const userName = user.members && user.members.length > 0 
      ? user.members[0].name 
      : 'Usuário';

    // Gerar token seguro de reset (32 bytes = 64 hex chars)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash do token para armazenar no banco
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Salvar hashedToken e expiração no banco (1 hora)
    await this.userRepo.update(user.id, { 
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hora
    });

    // Construir URL de reset
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://oliva.church';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // Enviar email através do EmailService
    await this.emailService.sendPasswordReset(
      user.email,
      hashedToken,
      resetUrl,
    );

    return {
      message: 'Email de recuperação enviado com sucesso. Verifique sua caixa de entrada.',
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    // Hash do token recebido para comparar com o banco
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Buscar usuário pelo token e verificar expiração
    const user = await this.userRepo.findOne({
      where: {
        resetPasswordToken: hashedToken,
      },
    } as any);

    if (!user) {
      throw new InvalidTokenError();
    }

    // Verificar se o token expirou
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new TokenExpiredError();
    }

    // Hash da nova senha
    const hashedPassword = await cryptoUtils.hash(newPassword);

    // Atualizar senha e limpar token
    await this.userRepo.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });

    return {
      success: true,
      message: 'Senha alterada com sucesso',
    };
  }
}
