import { DataSource } from 'typeorm';
import { ChurchSubscription } from '../entities/church-subscription.entity';
import { Church } from '../entities/church.entity';
import { Member } from '../entities/member.entity';
import { Plan } from '../entities/plan.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [ChurchSubscription, Church, Member, Plan, Role, User],
  migrations: ['src/database/migrations/**/*.ts'],
  synchronize: false,
  logging: true,
});
