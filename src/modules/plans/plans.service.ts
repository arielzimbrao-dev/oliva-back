import { Injectable } from '@nestjs/common';
import { PlanDto } from './dtos/plan.dto';
import { PlanRepository } from 'src/entities/repository/plan.entity';

@Injectable()
export class PlansService {
  constructor(
    private planRepo: PlanRepository,
  ) {}

  async getPlans(): Promise<PlanDto[]> {
    const plans = await this.planRepo.findAll();
    console.log(plans);
    return plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      priceDolar: parseFloat(plan.amountDolar),
      priceEuro: parseFloat(plan.amountEuro),
      priceReal: parseFloat(plan.amountReal),
      freeDays: plan.freeDays.toString(),
    }));
  }
}