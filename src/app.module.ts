import { PaymentController } from './payment/payment.controller';
import { PaymentService } from './payment/payment.service';
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ContextInterceptor } from './common/util/context/context-interceptor';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EmailService } from './modules/email/email.service';
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
import { DepartmentRepository } from './entities/repository/department.repository';
import { MemberDepartmentRepository } from './entities/repository/member-department.repository';
import { DepartmentsService } from './modules/departments/departments.service';
import { DepartmentsController } from './modules/departments/departments.controller';
import { MembersService } from './modules/members/members.service';
import { MembersController } from './modules/members/members.controller';
import { MemberFamilyRepository } from './entities/repository/member-family.repository';
import { FinancialTransactionRepository } from './entities/repository/financial-transaction.repository';
import { RecurringPaymentRepository } from './entities/repository/recurring-payment.repository';
import { FinancialTransactionService } from './modules/financial/financial-transaction.service';
import { FinancialTransactionController } from './modules/financial/financial-transaction.controller';
import { json } from 'body-parser';
import { PaymentSession } from './entities/payment-session.entity';
import { PaymentSessionRepository } from './entities/repository/payment-session.repository';
import { PaymentEventRepository } from './entities/repository/payment-event.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 10, // 10 requests per minute (global default)
    }]),
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    ChurchSubscriptionRepository,
    ChurchRepository,
    MemberRepository,
    PlanRepository,
    RoleRepository,
    UserRepository,
    DepartmentRepository,
    MemberDepartmentRepository,
    MemberFamilyRepository,
    FinancialTransactionRepository,
    RecurringPaymentRepository,
    PaymentSessionRepository,
    PaymentEventRepository,

    AppService,
    AuthService,
    ChurchService,
    PlansService,
    UserService,
    DepartmentsService,
    MembersService,
    FinancialTransactionService,
    PaymentService,
    EmailService
  ],
  controllers: [
    AppController, 
    AuthController, 
    ChurchController, 
    PlansController, 
    UserController,
    DepartmentsController,
    MembersController,
    FinancialTransactionController,
    PaymentController
  ],
  exports: [
    ...databaseProviders,
    Context,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply json parser with rawBody preservation for webhook verification
    consumer
      .apply(
        json({
          limit: '50mb',
          verify: (req: any, res, buf, encoding) => {
            // Save raw buffer for webhook signature verification on /payment/webhook endpoint
            if (req.url === '/payment/webhook' || req.url.startsWith('/payment/webhook?')) {
              req.rawBody = buf.toString('utf8');
            }
          },
        }),
      )
      .forRoutes('*');
  }
}
