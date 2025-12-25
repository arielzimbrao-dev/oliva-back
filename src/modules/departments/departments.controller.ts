import { Controller, Get, Post, Patch, Delete, Param, Body, Request, UseGuards, Query } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.auth.guard';
import { CreateDepartmentDto } from './dtos/create-department.dto';
import { UpdateDepartmentDto } from './dtos/update-department.dto';
import { DepartmentResponseDto, DepartmentListResponseDto } from './dtos/department-response.dto';

@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('filter') filter?: string
  ): Promise<DepartmentListResponseDto> {
    return this.departmentsService.findAll({
      churchId: req.user.churchId,
      page,
      limit,
      filter: filter || '',
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<DepartmentResponseDto> {
    return this.departmentsService.findOne(id);
  }

  @Post()
  async create(@Body() body: CreateDepartmentDto, @Request() req): Promise<DepartmentResponseDto> {
    return this.departmentsService.create({ ...body, churchId: req.user.churchId });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateDepartmentDto): Promise<DepartmentResponseDto> {
    return this.departmentsService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.departmentsService.remove(id);
  }
}
