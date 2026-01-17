import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../../entities/repository/user.repository';
import { cryptoUtils } from 'src/common/util/crypto.utils';
import { LoginResponseDto } from './dtos/login-response.dto';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.userRepo.findOne({ where: { email }, relations: ['members', 'church'] } as any);
    if (!user) throw new UnauthorizedException();

    const ok = await cryptoUtils.compare(password, user.password);
    if (!ok) throw new UnauthorizedException();

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
      throw new BadRequestException('Usuário não encontrado');
    }

    // Verificar se o usuário está ativo
    if (user.state !== 'ACTIVE') {
      throw new BadRequestException('Usuário não está ativo');
    }

    // Obter nome do membro (primeiro membro associado)
    const userName = user.members && user.members.length > 0 
      ? user.members[0].name 
      : 'Usuário';

    // Gerar token seguro de reset (32 bytes = 64 hex chars)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash do token para armazenar no banco (implementar depois)
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // TODO: Salvar hashedToken e expiração no banco de dados
    // Exemplo: await this.userRepo.update(user.id, { 
    //   resetPasswordToken: hashedToken,
    //   resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hora
    // });

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
}
