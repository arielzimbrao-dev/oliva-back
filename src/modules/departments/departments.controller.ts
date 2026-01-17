import { Controller, Get, Post, Patch, Delete, Param, Body, Request, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.auth.guard';
import { CreateDepartmentDto } from './dtos/create-department.dto';
import { UpdateDepartmentDto } from './dtos/update-department.dto';
import { DepartmentResponseDto, DepartmentListResponseDto } from './dtos/department-response.dto';

@ApiTags('Departments')
@Controller('departments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'List departments',
    description: 'Lists all church departments with pagination'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'filter', required: false, description: 'Search filter' })
  @ApiResponse({ status: 200, description: 'List of departments', type: DepartmentListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiOperation({ 
    summary: 'Get department by ID',
    description: 'Returns details of a specific department'
  })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ status: 200, description: 'Department details', type: DepartmentResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findOne(@Param('id') id: string, @Request() req): Promise<DepartmentResponseDto> {
    return this.departmentsService.findOne(id, req.user.churchId);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create department',
    description: 'Creates a new department in the church'
  })
  @ApiBody({ type: CreateDepartmentDto })
  @ApiResponse({ status: 201, description: 'Department created', type: DepartmentResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() body: CreateDepartmentDto, @Request() req): Promise<DepartmentResponseDto> {
    return this.departmentsService.create({ ...body, churchId: req.user.churchId });
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update department',
    description: 'Updates an existing department'
  })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiBody({ type: UpdateDepartmentDto })
  @ApiResponse({ status: 200, description: 'Department updated', type: DepartmentResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async update(@Param('id') id: string, @Body() body: UpdateDepartmentDto, @Request() req): Promise<DepartmentResponseDto> {
    return this.departmentsService.update(id, { ...body, churchId: req.user.churchId });
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete department',
    description: 'Permanently removes a department'
  })
  @ApiParam({ name: 'id', description: 'Department ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Department deleted',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Department deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.departmentsService.remove(id, req.user.churchId);
  }
}
