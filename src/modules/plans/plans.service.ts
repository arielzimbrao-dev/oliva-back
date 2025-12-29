import { Injectable } from '@nestjs/common';
import { PlanResponseDto, PlanListResponseDto } from './dtos/plan-response.dto';
import { PlanRepository } from 'src/entities/repository/plan.entity';

@Injectable()
export class PlansService {
  constructor(
    private planRepo: PlanRepository,
  ) {}

  async getPlans(): Promise<PlanListResponseDto> {
    const plans = await this.planRepo.findAll();
    return {
      total: plans.length,
      data: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        description: plan.description,
        amountDolar: plan.amountDolar,
        amountEuro: plan.amountEuro,
        amountReal: plan.amountReal,
        memberLimit: plan.memberLimit,
        freeDays: plan.freeDays,
        linkPayment: plan.linkPayment,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      })),
    };
  }
}