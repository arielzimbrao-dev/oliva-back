import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt.auth.guard';
import { CreateMemberDto } from '../users/dtos/create-member.dto';
import { UpdateMemberDto } from '../users/dtos/update-member.dto';
import { MemberResponseDto, MemberListResponseDto } from './dtos/member-response.dto';
import { MemberEventsResponseDto } from './dtos/member-events-response.dto';
import { MemberStatsResponseDto } from './dtos/member-stats-response.dto';
import { MembersService } from './members.service';
import { IsPublic } from '../auth/jwt/is-public.decoretor';

@ApiTags('Members')
@Controller('members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('public')
  @IsPublic()
  @ApiOperation({ 
    summary: 'Listar membros público',
    description: 'Lista membros de uma igreja (público, sem autenticação)'
  })
  @ApiQuery({ name: 'churchId', required: true, description: 'ID da igreja' })
  @ApiQuery({ name: 'name', required: false, description: 'Filtro por nome' })
  @ApiResponse({ status: 200, description: 'Lista de membros', type: MemberListResponseDto })
  async findAllPublic(
    @Query('churchId') churchId: string,
    @Query('name') name?: string
  ): Promise<MemberListResponseDto> {
    return this.membersService.findAll({
      churchId,
      page: 1,
      limit: 9999,
      filter: name || '',
    });
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar membros',
    description: 'Lista membros da igreja do usuário autenticado com paginação'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'filter', required: false, description: 'Filtro de busca' })
  @ApiResponse({ status: 200, description: 'Lista de membros', type: MemberListResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findAll(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('filter') filter?: string
  ): Promise<MemberListResponseDto> {
    return this.membersService.findAll({
      churchId: req.user.churchId,
      page,
      limit,
      filter: filter || '',
    });
  }

  @Get('events')
  @ApiOperation({ 
    summary: 'Listar eventos de membros',
    description: 'Retorna aniversários e outros eventos de membros em um período'
  })
  @ApiQuery({ name: 'start_date', required: true, description: 'Data inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: true, description: 'Data final (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Eventos de membros', type: MemberEventsResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findEvents(
    @Request() req,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string
  ): Promise<MemberEventsResponseDto> {
    return this.membersService.findEvents(req.user.churchId, startDate, endDate);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Estatísticas de membros',
    description: 'Retorna estatísticas de crescimento e eventos em um período'
  })
  @ApiQuery({ name: 'start_date', required: true, description: 'Data inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: true, description: 'Data final (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Estatísticas', type: MemberStatsResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getStats(
    @Request() req,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string
  ): Promise<MemberStatsResponseDto> {
    return this.membersService.getStats(req.user.churchId, startDate, endDate);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req): Promise<MemberResponseDto> {
    return this.membersService.findOne(id, req.user.churchId);
  }

  @Post()
  async create(@Body() body: CreateMemberDto, @Request() req): Promise<MemberResponseDto> {
    return this.membersService.create({ ...body, churchId: req.user.churchId });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateMemberDto, @Request() req): Promise<MemberResponseDto> {
    return this.membersService.update(id, { ...body, churchId: req.user.churchId });
  }

  @Post('self')
  @IsPublic()
  async createSelf(
    @Body() body: CreateMemberDto,
    @Query('churchId') churchId: string
  ): Promise<MemberResponseDto> {
    // Não associar a departamentos
    return this.membersService.create({ ...body, churchId });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.membersService.remove(id, req.user.churchId);
  }
}
