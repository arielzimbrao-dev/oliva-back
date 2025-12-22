import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, enum: ['ADMIN', 'TREASURY', 'SECRETARY'], enumName: 'RoleName', type: 'enum' })
  slug: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;
}
