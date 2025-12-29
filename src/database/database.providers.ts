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
import { FinancialTransaction } from 'src/entities/financial-transaction.entity';

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
          MemberFamily,
          FinancialTransaction,
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
          }
        }

        const plans = [
          {
            id: 'e7274c09-35a5-427c-9188-a921ae0fc38b',
            name: 'Trial',
            description: 'Unlimited members',
            amountDolar: '0.00',
            amountEuro: '0.00',
            amountReal: '0.00',
            memberLimit: 999999999,
            linkPayment: '',
            freeDays: 7
          },
          {
            id: '01dcf308-43a1-485b-912b-b10bb0040d77',
            name: 'Bronze',
            description: 'Up to 500 members',
            amountDolar: '29.00',
            amountEuro: '25.00',
            amountReal: '149.00',
            memberLimit: 500,
            linkPayment: 'https://buy.stripe.com/test_bJe6oJ3VH6U94qn2p10RG00',
            freeDays: 0
          },
          {
            id: 'f1a74eba-81c3-42ae-a434-fda56cd3833c',
            name: 'Silver',
            description: 'Up to 1000 members',
            amountDolar: '59.00',
            amountEuro: '49.00',
            amountReal: '299.00',
            memberLimit: 1000,
            linkPayment: 'https://buy.stripe.com/test_7sY3cx77Ta6lg95bZB0RG01',
            freeDays: 0
          },
          {
            id: 'd9192d1d-a1b4-44c4-a52a-6759dd3edc4d',
            name: 'Gold',
            description: 'Unlimited members',
            amountDolar: '129.00',
            amountEuro: '109.00',
            amountReal: '599.00',
            memberLimit: 999999999,
            linkPayment: 'https://buy.stripe.com/test_14A5kF1Nzdixf515Bd0RG02',
            freeDays: 0
          },
        ];

        for (const plan of plans) {
          const exists = await planRepo.findOne({ where: { id: plan.id } });
          if (!exists) {
            await planRepo.save(plan);
          } else {
            // Atualiza se algum campo relevante estiver diferente
            if (
              exists.memberLimit !== plan.memberLimit ||
              exists.freeDays !== plan.freeDays ||
              exists.amountDolar !== plan.amountDolar ||
              exists.amountEuro !== plan.amountEuro ||
              exists.amountReal !== plan.amountReal ||
              exists.linkPayment !== plan.linkPayment
            ) {
              await planRepo.update(plan.id, {
                memberLimit: plan.memberLimit,
                freeDays: plan.freeDays,
                amountDolar: plan.amountDolar,
                amountEuro: plan.amountEuro,
                amountReal: plan.amountReal,
                linkPayment: plan.linkPayment
              });
            }
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
  {
    provide: 'FINANCIAL_TRANSACTION_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(FinancialTransaction),
    inject: ['DATA_SOURCE'],
  },
];
