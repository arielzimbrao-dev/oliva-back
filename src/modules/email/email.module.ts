import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { UserRepository } from '../../entities/repository/user.repository';
import { ChurchRepository } from '../../entities/repository/church.repository';
import { DatabaseModule } from '../../database/database.providers';

@Module({
  imports: [ConfigModule, DatabaseModule],
  controllers: [EmailController],
  providers: [EmailService, UserRepository, ChurchRepository],
  exports: [EmailService],
})
export class EmailModule {}
