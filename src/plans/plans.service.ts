import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '../entities/plan.entity';
import { PlanDto } from './dtos/plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan) private planRepo: Repository<Plan>,
  ) {}

  async getPlans(): Promise<PlanDto[]> {
    const plans = await this.planRepo.find();
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