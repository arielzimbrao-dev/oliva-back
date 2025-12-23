import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ unique: true, enum: ['ADMIN', 'TREASURY', 'SECRETARY', 'PASTOR', 'MEMBER'], enumName: 'RoleName', type: 'enum' })
  slug: string;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;
}
