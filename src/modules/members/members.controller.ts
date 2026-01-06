import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.auth.guard';
import { CreateMemberDto } from '../users/dtos/create-member.dto';
import { UpdateMemberDto } from '../users/dtos/update-member.dto';
import { MemberResponseDto, MemberListResponseDto } from './dtos/member-response.dto';
import { MembersService } from './members.service';
import { IsPublic } from '../auth/jwt/is-public.decoretor';

@Controller('members')
@UseGuards(JwtAuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
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
