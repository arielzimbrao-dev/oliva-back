import { Controller, Get } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlanDto } from './dtos/plan.dto';

@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Get()
  async getPlans(): Promise<PlanDto[]> {
    return this.plansService.getPlans();
  }
}