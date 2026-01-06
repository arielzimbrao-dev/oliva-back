import { Inject, Injectable } from '@nestjs/common';
import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { PaymentSession } from '../payment-session.entity';
import { BaseRepository } from '../../common/repository/base.repository';

@Injectable()
export class PaymentSessionRepository {
  private base: BaseRepository<PaymentSession>;

  constructor(
    @Inject('PAYMENT_SESSION_REPOSITORY')
    private readonly paymentSessionRepository: Repository<PaymentSession>,
  ) {
    this.base = new BaseRepository<PaymentSession>(this.paymentSessionRepository);
  }

  findAll(options?: FindManyOptions<PaymentSession>) {
    return this.base.findAll(options);
  }

  findOne(options: FindOneOptions<PaymentSession>) {
    return this.base.findOne(options);
  }

  findOneById(id: string) {
    return this.base.findOneById(id);
  }

  create(entity: Partial<PaymentSession>) {
    return this.base.create(entity);
  }

  save(entity: PaymentSession) {
    return this.base.save(entity);
  }

  update(id: string, partial: Partial<PaymentSession>) {
    return this.base.update(id, partial);
  }

  softDelete(id: string) {
    return this.base.softDelete(id);
  }
}
