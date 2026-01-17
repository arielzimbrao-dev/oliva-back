import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { IsPublic } from './modules/auth/jwt/is-public.decoretor';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @IsPublic()
  @ApiOperation({ 
    summary: 'System health check',
    description: 'Checks if the API is operational'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'System operational',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2026-01-17T10:00:00.000Z' }
      }
    }
  })
  health(): { status: string; timestamp: string } {
    return this.appService.healthCheck();
  }
}
