import { Controller, Get } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlanResponseDto, PlanListResponseDto } from './dtos/plan-response.dto';

@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Get()
  async getPlans(): Promise<PlanListResponseDto> {
    return this.plansService.getPlans();
  }
}