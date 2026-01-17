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
    summary: 'Listar todos os planos',
    description: 'Retorna lista de planos disponíveis (Trial, Bronze, Silver, Gold) com preços e limites'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de planos',
    type: PlanListResponseDto
  })
  async getPlans(): Promise<PlanListResponseDto> {
    return this.plansService.getPlans();
  }
}