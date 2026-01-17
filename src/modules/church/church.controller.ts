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
    summary: 'Obter informações públicas da igreja',
    description: 'Retorna nome e se a igreja permite adicionar novos membros (público)'
  })
  @ApiQuery({ name: 'churchId', description: 'ID da igreja' })
  @ApiResponse({ 
    status: 200, 
    description: 'Informações públicas da igreja',
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
    summary: 'Obter informações da igreja do usuário',
    description: 'Retorna todas as informações da igreja associada ao usuário autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Informações completas da igreja',
    type: ChurchInfoResponseDto
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getChurchInfo(@Request() req): Promise<ChurchInfoResponseDto> {
    return this.churchService.getChurchInfo(req.user.churchId);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Atualizar informações da igreja',
    description: 'Atualiza os dados da igreja do usuário autenticado'
  })
  @ApiBody({ type: UpdateChurchDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Igreja atualizada com sucesso',
    type: ChurchInfoResponseDto
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async updateChurch(@Request() req, @Body() dto: UpdateChurchDto): Promise<ChurchInfoResponseDto> {
    return this.churchService.updateChurch(req.user.churchId, dto);
  }

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @IsPublic()
  @ApiOperation({ 
    summary: 'Registrar nova igreja',
    description: 'Cria uma nova igreja com usuário administrador e plano Trial de 15 dias'
  })
  @ApiBody({ type: RegisterChurchRequestDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Igreja registrada com sucesso',
    type: RegisterChurchResponseDto
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou email já cadastrado' })
  async signup(@Body() dto: RegisterChurchRequestDto): Promise<RegisterChurchResponseDto> {
    return this.churchService.registerChurch(dto);
  }
}
