import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../entities/repository/user.repository';
import { cryptoUtils } from 'src/common/util/crypto.utils';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RefreshTokenResponseDto } from './dtos/refresh-token-response.dto';

@Injectable()
export class AuthService {
  constructor(private userRepo: UserRepository, private jwtService: JwtService) {}

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.userRepo.findOne({ where: { email } } as any);

    if (!user) throw new UnauthorizedException();

    const ok = await cryptoUtils.compare(password, user.password);
    if (!ok) throw new UnauthorizedException();

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
    };
  }

  async refresh(refreshToken: string): Promise<RefreshTokenResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const accessToken = await this.jwtService.signAsync({ sub: payload.sub, email: payload.email, churchId: payload.churchId, role: payload.role }, { expiresIn: '15m' });
      return { accessToken, refreshToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
