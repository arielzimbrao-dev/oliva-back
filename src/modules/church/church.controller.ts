import { Patch } from '@nestjs/common';
import { UpdateChurchDto } from './dtos/update-church.dto';
import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe, Get, Request, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ChurchService } from './church.service';
import { RegisterChurchRequestDto } from './dtos/register-church-request.dto';
import { RegisterChurchResponseDto } from '../auth/dtos/register-church-response.dto';
import { ChurchInfoResponseDto } from './dtos/church-info-response.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt.auth.guard';
import { IsPublic } from '../auth/jwt/is-public.decoretor';

@ApiTags('Church')
@Controller('church')
export class ChurchController {
  constructor(private readonly churchService: ChurchService) {}

  @Get('public')
  @IsPublic()
  @ApiOperation({ 
    summary: 'Get church public information',
    description: 'Returns church name and whether it allows adding new members (public endpoint)'
  })
  @ApiQuery({ name: 'churchId', description: 'Church ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Church public information',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        canAddMembers: { type: 'boolean' }
      }
    }
  })
  async getChurchPublicInfo(@Query('churchId') churchId: string): Promise<{ name: string; canAddMembers: boolean }> {
    return await this.churchService.getChurchPublicInfo(churchId);
  }
  
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user church information',
    description: 'Returns all information of the church associated with the authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Complete church information',
    type: ChurchInfoResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getChurchInfo(@Request() req): Promise<ChurchInfoResponseDto> {
    return this.churchService.getChurchInfo(req.user.churchId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update church information',
    description: 'Updates the authenticated user church data'
  })
  @ApiBody({ type: UpdateChurchDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Church updated successfully',
    type: ChurchInfoResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateChurch(@Request() req, @Body() dto: UpdateChurchDto): Promise<ChurchInfoResponseDto> {
    return this.churchService.updateChurch(req.user.churchId, dto);
  }

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @IsPublic()
  @ApiOperation({ 
    summary: 'Register new church',
    description: 'Creates a new church with admin user and 15-day Trial plan'
  })
  @ApiBody({ type: RegisterChurchRequestDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Church registered successfully',
    type: RegisterChurchResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid data or email already registered' })
  async signup(@Body() dto: RegisterChurchRequestDto): Promise<RegisterChurchResponseDto> {
    return this.churchService.registerChurch(dto);
  }
}
