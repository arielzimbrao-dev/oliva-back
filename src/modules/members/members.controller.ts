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
    summary: 'List public members',
    description: 'Lists members of a church (public, no authentication required)'
  })
  @ApiQuery({ name: 'churchId', required: true, description: 'Church ID' })
  @ApiQuery({ name: 'name', required: false, description: 'Filter by name' })
  @ApiResponse({ status: 200, description: 'List of members', type: MemberListResponseDto })
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
    summary: 'List members',
    description: 'Lists members of the authenticated user\'s church with pagination'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'filter', required: false, description: 'Search filter' })
  @ApiResponse({ status: 200, description: 'List of members', type: MemberListResponseDto })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
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
    summary: 'List member events',
    description: 'Returns birthdays and other member events within a period'
  })
  @ApiQuery({ name: 'start_date', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: true, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Member events', type: MemberEventsResponseDto })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async findEvents(
    @Request() req,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string
  ): Promise<MemberEventsResponseDto> {
    return this.membersService.findEvents(req.user.churchId, startDate, endDate);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Member statistics',
    description: 'Returns growth and event statistics within a period'
  })
  @ApiQuery({ name: 'start_date', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end_date', required: true, description: 'End date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Statistics', type: MemberStatsResponseDto })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
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
