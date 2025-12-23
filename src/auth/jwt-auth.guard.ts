import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ConsoleLogger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers.authorization;
    console.log('Authorization Header:', auth);
    if (!auth) throw new UnauthorizedException('No Authorization header');
    const parts = auth.split(' ');
    console.log('Authorization Parts:', parts);
    if (parts.length !== 2) throw new UnauthorizedException('Bad Authorization header');
    const token = parts[1];
    try {
      const payload = await this.jwtService.verifyAsync(token);
      (req as any).user = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
