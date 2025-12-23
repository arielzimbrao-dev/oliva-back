import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { Church } from '../entities/church.entity';
import { Member } from '../entities/member.entity';
import { Plan } from '../entities/plan.entity';
import { ChurchSubscription } from '../entities/church-subscription.entity';
import { Role } from '../entities/role.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Church, Member, Role]),
    JwtModule.registerAsync({
      useFactory: () => {
        let privateKey = process.env.RSA_PRIVATE_KEY
          ? process.env.RSA_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined;
        let publicKey = process.env.RSA_PUBLIC_KEY
          ? process.env.RSA_PUBLIC_KEY.replace(/\\n/g, '\n')
          : undefined;

        if (!privateKey || !publicKey) {
          try {
            const base = process.cwd();
            const privPath = path.join(base, 'jwt_rsa_key');
            const pubPath = path.join(base, 'jwt_rsa_key.pub');
            if (!privateKey && fs.existsSync(privPath)) {
              privateKey = fs.readFileSync(privPath, 'utf8').replace(/\r?\n/g, '\n');
            }
            if (!publicKey && fs.existsSync(pubPath)) {
              publicKey = fs.readFileSync(pubPath, 'utf8').replace(/\r?\n/g, '\n');
            }
          } catch (e) {
            // ignore and fallback to secret
          }
        }

        if (privateKey && publicKey) {
          return {
            privateKey,
            publicKey,
            signOptions: { algorithm: 'RS256', expiresIn: '15m' },
          };
        }

        const secret = process.env.JWT_SECRET || randomBytes(64).toString('hex');
        return {
          secret,
          signOptions: { algorithm: 'HS256', expiresIn: '15m' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
