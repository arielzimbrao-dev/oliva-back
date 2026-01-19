import { Inject, Injectable } from "@nestjs/common";
import { ChurchSubscription } from "../church-subscription.entity";
import { Repository, FindOneOptions, FindManyOptions } from "typeorm";
import { BaseRepository } from "../../common/repository/base.repository";

@Injectable()
export class ChurchSubscriptionRepository {
  private base: BaseRepository<ChurchSubscription>;

  constructor(
    @Inject('CHURCH_SUBSCRIPTION_REPOSITORY')
    private readonly churchSubscriptionRepository: Repository<ChurchSubscription>,
  ) {
    this.base = new BaseRepository<ChurchSubscription>(this.churchSubscriptionRepository);
  }

  findAll(options?: FindManyOptions<ChurchSubscription>) {
    return this.base.findAll(options);
  }

  findOne(options: FindOneOptions<ChurchSubscription>) {
    return this.base.findOne(options);
  }

  findOneById(id: string) {
    return this.base.findOneById(id);
  }

  create(entity: Partial<ChurchSubscription>) {
    return this.base.create(entity);
  }

  save(entity: ChurchSubscription) {
    return this.base.save(entity);
  }

  update(id: string, partial: Partial<ChurchSubscription>) {
    return this.base.update(id, partial);
  }

  softDelete(id: string) {
    return this.base.softDelete(id);
  }

  findLatestByChurchId(churchId: string) {
    return this.base.findOne({
      where: { churchId },
      order: { createdAt: 'DESC' }
    } as any);
  }

  findByStripeSubscriptionId(stripeSubscriptionId: string) {
    return this.base.findOne({
      where: { stripeSubscriptionId }
    } as any);
  }

  findByChurchAndPlanAndStatus(churchId: string, planId: string, status: string) {
    return this.base.findOne({
      where: { churchId, planId, status },
      order: { createdAt: 'DESC' }
    } as any);
  }

  findActiveByChurchId(churchId: string) {
    return this.base.findOne({
      where: { churchId, status: 'active' },
      order: { createdAt: 'DESC' }
    } as any);
  }

  findByChurchAndPlan(churchId: string, planId: string) {
    return this.base.findOne({
      where: { churchId, planId },
      order: { createdAt: 'DESC' }
    } as any);
  }

  findLatestByChurchIdWithPlan(churchId: string) {
    return this.base.findOne({
      where: { churchId },
      relations: ['plan'],
      order: { createdAt: 'DESC' }
    } as any);
  }
}