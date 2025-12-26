import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ChurchSubscription } from 'src/entities/church-subscription.entity';
import { Church } from 'src/entities/church.entity';
import { Member } from 'src/entities/member.entity';
import { Plan } from 'src/entities/plan.entity';
import { Role } from 'src/entities/role.entity';
import { User } from 'src/entities/user.entity';
import { Department } from 'src/entities/department.entity';
import { MemberDepartment } from 'src/entities/member-department.entity';
import { MemberFamily } from 'src/entities/member-family.entity';

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
        entities: [
          ChurchSubscription,
          Church,
          Member,
          Plan,
          Role,
          User,
          Department,
          MemberDepartment,
        ],
        synchronize: true,
        logging: true,
      });

      const ds = await dataSource.initialize();

      // Função para popular/atualizar roles e plans
      async function ensureDefaults() {
        const roleRepo = ds.getRepository(Role);
        const planRepo = ds.getRepository(Plan);

        // Roles
        const roles = [
          { slug: 'ADMIN', name: 'Administrador', description: 'Acesso total' },
          { slug: 'TREASURY', name: 'Tesouraria', description: 'Financeiro' },
          { slug: 'SECRETARY', name: 'Secretária', description: 'Secretaria' },
          { slug: 'PASTOR', name: 'Pastor', description: 'Pastor da igreja' },
        ];
        for (const role of roles) {
          const exists = await roleRepo.findOne({ where: { slug: role.slug } });
          if (!exists) {
            await roleRepo.save(role);
          } else {
            await roleRepo.update({ slug: role.slug }, role);
          }
        }

        // Plans
        const plans = [
          { id: 'e7274c09-35a5-427c-9188-a921ae0fc38b', name: 'Trial', description: 'Unlimited members', amountDolar: '0.00', amountEuro: '0.00', amountReal: '0.00', memberLimit: 999999999, freeDays: 15 },
          { id: '01dcf308-43a1-485b-912b-b10bb0040d77', name: 'Bronze', description: 'Up to 500 members', amountDolar: '60.00', amountEuro: '50.00', amountReal: '320.00', memberLimit: 500, freeDays: 0 },
          { id: 'f1a74eba-81c3-42ae-a434-fda56cd3833c', name: 'Silver', description: 'Up to 1000 members', amountDolar: '120.00', amountEuro: '100.00', amountReal: '650.00', memberLimit: 1000, freeDays: 0 },
          { id: 'd9192d1d-a1b4-44c4-a52a-6759dd3edc4d', name: 'Gold', description: 'Unlimited members', amountDolar: '300.00', amountEuro: '250.00', amountReal: '1200.00', memberLimit: 999999999, freeDays: 0 },
        ];
        for (const plan of plans) {
          const exists = await planRepo.findOne({ where: { id: plan.id } });
          if (!exists) {
            await planRepo.save(plan);
          } else {
            await planRepo.update({ id: plan.id }, plan);
          }
        }
      }

      await ensureDefaults();
      return ds;
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
  {
    provide: 'DEPARTMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Department),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'MEMBER_DEPARTMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MemberDepartment),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'MEMBER_FAMILY_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(MemberFamily),
    inject: ['DATA_SOURCE'],
  },
];
