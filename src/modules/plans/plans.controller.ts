import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { PlanResponseDto, PlanListResponseDto } from './dtos/plan-response.dto';
import { IsPublic } from '../auth/jwt/is-public.decoretor';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Get()
  @IsPublic()
  @ApiOperation({ 
    summary: 'List all plans',
    description: 'Returns list of available plans (Trial, Bronze, Silver, Gold) with prices and limits'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of plans',
    type: PlanListResponseDto
  })
  async getPlans(): Promise<PlanListResponseDto> {
    return this.plansService.getPlans();
  }
}