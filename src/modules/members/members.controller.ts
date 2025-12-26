import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt.auth.guard';
import { CreateMemberDto } from '../users/dtos/create-member.dto';
import { UpdateMemberDto } from '../users/dtos/update-member.dto';
import { MemberResponseDto, MemberListResponseDto } from './dtos/member-response.dto';
import { MembersService } from './members.service';

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
  async findOne(@Param('id') id: string): Promise<MemberResponseDto> {
    return this.membersService.findOne(id);
  }

  @Post()
  async create(@Body() body: CreateMemberDto, @Request() req): Promise<MemberResponseDto> {
    return this.membersService.create({ ...body, churchId: req.user.churchId });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateMemberDto): Promise<MemberResponseDto> {
    return this.membersService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.membersService.remove(id);
  }
}
