import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../entities/repository/user.repository';
import { cryptoUtils } from 'src/common/util/crypto.utils';
import { LoginResponseDto } from './dtos/login-response.dto';

@Injectable()
export class AuthService {
  constructor(private userRepo: UserRepository, private jwtService: JwtService) {}

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
        memberName,
        churchName,
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
