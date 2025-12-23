import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ChurchSubscription } from 'src/entities/church-subscription.entity';
import { Church } from 'src/entities/church.entity';
import { Member } from 'src/entities/member.entity';
import { Plan } from 'src/entities/plan.entity';
import { Role } from 'src/entities/role.entity';
import { User } from 'src/entities/user.entity';

// Carregar variáveis do arquivo .env
dotenv.config();

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: true,
      });

      return dataSource.initialize();
    },
  },
  {
    provide: 'CHURCH_SUBSCRIPTION_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ChurchSubscription),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'CHURCH_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Church),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'MEMBER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Member),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'PLAN_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Plan),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ROLE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Role),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DATA_SOURCE'],
  },
];
