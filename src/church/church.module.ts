import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ChurchController } from './church.controller';
import { ChurchService } from './church.service';
import { User } from '../entities/user.entity';
import { Church } from '../entities/church.entity';
import { Member } from '../entities/member.entity';
import { Plan } from '../entities/plan.entity';
import { ChurchSubscription } from '../entities/church-subscription.entity';

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
  controllers: [ChurchController],
  providers: [ChurchService],
  exports: [ChurchService],
})
export class ChurchModule {}
