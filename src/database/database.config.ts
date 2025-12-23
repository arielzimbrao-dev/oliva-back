import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Church } from '../entities/church.entity';
import { Plan } from '../entities/plan.entity';
import { ChurchSubscription } from '../entities/church-subscription.entity';
import { User } from '../entities/user.entity';
import { Member } from '../entities/member.entity';
import { Role } from '../entities/role.entity';

require('dotenv').config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'oliva_db',
  entities: [Church, Plan, ChurchSubscription, User, Member, Role],
  migrations: ['dist/migrations/*.js'],
  // Enable schema sync when NODE_ENV is not 'production' or when explicitly requested
  // Set TYPEORM_SYNC=true in your .env for local/dev environments to force sync
  synchronize: process.env.TYPEORM_SYNC === 'true' || process.env.NODE_ENV !== 'production',
  logging: process.env.TYPEORM_LOGGING === 'true' || process.env.NODE_ENV !== 'production',
};
