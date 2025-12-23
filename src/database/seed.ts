import { DataSource } from 'typeorm';
import { Plan } from '../entities/plan.entity';
import { Role } from '../entities/role.entity';
import * as dotenv from 'dotenv';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Plan, Role],
});

async function seed() {
  await AppDataSource.initialize();

  // Roles
  const roles = [
    { slug: 'ADMIN', name: 'Administrador', description: 'Acesso total' },
    { slug: 'TREASURY', name: 'Tesouraria', description: 'Financeiro' },
    { slug: 'SECRETARY', name: 'Secretária', description: 'Secretaria' },
    { slug: 'PASTOR', name: 'Pastor', description: 'Pastor da igreja' },
  ];
  for (const role of roles) {
    const exists = await AppDataSource.getRepository(Role).findOne({ where: { slug: role.slug } });
    if (!exists) {
      await AppDataSource.getRepository(Role).save(role);
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
    const exists = await AppDataSource.getRepository(Plan).findOne({ where: { id: plan.id } });
    if (!exists) {
      await AppDataSource.getRepository(Plan).save(plan);
    }
  }

  await AppDataSource.destroy();
  console.log('Seed concluído!');
}

seed().catch((e) => { console.error(e); process.exit(1); });
