import { Injectable, Inject } from '@nestjs/common';
import { Repository, FindOneOptions, FindManyOptions, IsNull } from 'typeorm';
import { RecurringPayment } from '../recurring-payment.entity';
import { BaseRepository } from '../../common/repository/base.repository';

@Injectable()
export class RecurringPaymentRepository {
  private base: BaseRepository<RecurringPayment>;

  constructor(
    @Inject('RECURRING_PAYMENT_REPOSITORY')
    private readonly repo: Repository<RecurringPayment>,
  ) {
    this.base = new BaseRepository<RecurringPayment>(this.repo);
  }

  findAll(options?: FindManyOptions<RecurringPayment>) {
    return this.base.findAll(options);
  }

  findOne(options: FindOneOptions<RecurringPayment>) {
    return this.base.findOne(options);
  }

  findOneById(id: string) {
    return this.base.findOneById(id);
  }

  create(entity: Partial<RecurringPayment>) {
    return this.base.create(entity);
  }

  save(entity: RecurringPayment) {
    return this.base.save(entity);
  }

  update(id: string, partial: Partial<RecurringPayment>) {
    return this.base.update(id, partial);
  }

  softDelete(id: string) {
    return this.base.softDelete(id);
  }

  async findActive() {
    return this.repo.find({
      where: { isActive: true, deletedAt: IsNull() },
    });
  }

  async findPaginated({ page = 1, limit = 10, where = {} }: { page?: number; limit?: number; where?: any }) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.repo.findAndCount({
      where: { ...where, deletedAt: IsNull() },
      order: { createdAt: 'DESC' } as any,
      skip,
      take: limit,
    });
    return { data, total };
  }
}
