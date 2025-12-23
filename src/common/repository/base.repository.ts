import { Repository, FindManyOptions, FindOneOptions } from 'typeorm';

export class BaseRepository<T extends { id?: any; deletedAt?: Date }> {
  constructor(private readonly repo: Repository<T>) {}

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    const where = (options && (options as any).where) || {};
    (where as any).deletedAt = null;
    return this.repo.find({ ...(options || {}), where } as FindManyOptions<T>);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    const where = (options as any).where || {};
    (where as any).deletedAt = null;
    return this.repo.findOne({ ...(options || {}), where } as FindOneOptions<T>);
  }

  async findOneById(id: string): Promise<T | null> {
    return this.repo.findOne({ where: { id, deletedAt: null } as any } as FindOneOptions<T>);
  }

  async create(entity: Partial<T>): Promise<T> {
    const created = this.repo.create(entity as any);
    return this.repo.save(created as any);
  }

  async save(entity: T): Promise<T> {
    return this.repo.save(entity as any);
  }

  async update(id: string, partial: Partial<T>): Promise<T> {
    await this.repo.update(id as any, partial as any);
    const updated = await this.findOneById(id);
    if (!updated) throw new Error('Entity not found');
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.update(id as any, { deletedAt: new Date() } as any);
  }
}
