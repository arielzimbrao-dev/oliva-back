import { Module } from '@nestjs/common';
import { ContextInterceptor } from './common/util/context/context-interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Context } from './common/util/context/context';
import { databaseProviders } from './database/database.providers';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './modules/auth/jwt/jwt.auth.guard';
import { JwtStrategy } from './modules/auth/jwt/jwt.strategy';
import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';
import { ChurchController } from './modules/church/church.controller';
import { ChurchService } from './modules/church/church.service';
import { PlansService } from './modules/plans/plans.service';
import { UserService } from './modules/users/user.service';
import { PlansController } from './modules/plans/plans.controller';
import { UserController } from './modules/users/user.controller';
import { ChurchSubscriptionRepository } from './entities/repository/church-subscription.repository';
import { ChurchRepository } from './entities/repository/church.repository';
import { MemberRepository } from './entities/repository/member.repository';
import { PlanRepository } from './entities/repository/plan.entity';
import { RoleRepository } from './entities/repository/role.repository';
import { UserRepository } from './entities/repository/user.repository';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_KEY'),
        signOptions: {
          expiresIn: configService.get('TOKEN_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    ...databaseProviders,
    JwtAuthGuard,
    JwtStrategy,
    Context,
    ContextInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: ContextInterceptor,
    },

    ChurchSubscriptionRepository,
    ChurchRepository,
    MemberRepository,
    PlanRepository,
    RoleRepository,
    UserRepository,

    AppService,
    AuthService,
    ChurchService,
    PlansService,
    UserService

  ],
  controllers: [AppController, AuthController, ChurchController, PlansController, UserController],
  exports: [
    ...databaseProviders,
    Context,
  ],
})
export class AppModule {
}
