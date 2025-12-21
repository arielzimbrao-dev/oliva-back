import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './database/database.config';
import { AuthModule } from './auth/auth.module';
import { PlansModule } from './plans/plans.module';
import { ChurchModule } from './church/church.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    PlansModule,
    ChurchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
