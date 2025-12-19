import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthRegistrationController } from './auth-registration.controller';
import { AuthService } from './auth.service';
import { RegistrationService } from './registration.service';
import { User } from '../entities/user.entity';
import { Church } from '../entities/church.entity';
import { Member } from '../entities/member.entity';
import { Plan } from '../entities/plan.entity';
import { ChurchSubscription } from '../entities/church-subscription.entity';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Church, Member, Plan, ChurchSubscription]),
    JwtModule.registerAsync({
      useFactory: () => ({
        privateKey: process.env.RSA_PRIVATE_KEY
          ? process.env.RSA_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined,
        publicKey: process.env.RSA_PUBLIC_KEY
          ? process.env.RSA_PUBLIC_KEY.replace(/\\n/g, '\n')
          : undefined,
        signOptions: { algorithm: 'RS256', expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [AuthController, AuthRegistrationController],
  providers: [AuthService, RegistrationService, JwtAuthGuard],
  exports: [AuthService],
})
export class AuthModule {}
