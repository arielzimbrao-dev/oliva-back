import { Inject, Injectable } from '@nestjs/common';
import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { PaymentEvent } from '../payment-event.entity';
import { BaseRepository } from '../../common/repository/base.repository';

@Injectable()
export class PaymentEventRepository {
  private base: BaseRepository<PaymentEvent>;

  constructor(
    @Inject('PAYMENT_EVENT_REPOSITORY')
    private readonly paymentEventRepository: Repository<PaymentEvent>,
  ) {
    this.base = new BaseRepository<PaymentEvent>(this.paymentEventRepository);
  }

  async findOne(options: FindOneOptions<PaymentEvent>): Promise<PaymentEvent | null> {
    return this.base.findOne(options);
  }

  async findAll(options?: FindManyOptions<PaymentEvent>): Promise<PaymentEvent[]> {
    return this.base.findAll(options);
  }

  async save(entity: Partial<PaymentEvent>): Promise<PaymentEvent> {
    return this.paymentEventRepository.save(entity as any);
  }

  async update(id: string, entity: Partial<PaymentEvent>): Promise<void> {
    await this.paymentEventRepository.update(id, entity as any);
  }

  async remove(id: string): Promise<void> {
    await this.paymentEventRepository.delete(id);
  }
}
