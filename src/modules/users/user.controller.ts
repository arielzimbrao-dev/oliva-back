import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.auth.guard';
import { NoAccessPermissionError } from 'src/common/exceptions/exception';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateMemberDto } from './dtos/update-member.dto';
import { UserResponseDto, UserListResponseDto } from './dtos/user-response.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ 
    summary: 'List users (ADMIN only)',
    description: 'Lists all church users with pagination and filter. Requires ADMIN role.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'filter', required: false, type: String, description: 'Search filter' })
  @ApiResponse({ status: 200, description: 'List of users', type: UserListResponseDto })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'No permission (not ADMIN)' })
  async listUsers(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('filter') filter?: string
  ): Promise<UserListResponseDto> {
    if (req.user?.role?.slug !== 'ADMIN') {
      throw new NoAccessPermissionError();
    }
    return await this.userService.listUsers({ page, limit, filter, churchId: req.user.churchId });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get user by ID (ADMIN only)',
    description: 'Returns details of a specific user. Requires ADMIN role.'
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'No permission' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string, @Request() req): Promise<UserResponseDto> {
    if (req.user?.role?.slug !== 'ADMIN') {
      throw new NoAccessPermissionError();
    }
    return await this.userService.getUserById(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create new user (ADMIN only)',
    description: 'Creates a new user in the church. Can link to an existing member. Requires ADMIN role.'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'No permission' })
  async createUser(
    @Body() body: CreateUserDto,
    @Request() req,
  ): Promise<UserResponseDto> {
    if (req.user?.role?.slug !== 'ADMIN') {
      throw new NoAccessPermissionError();
    }
    return await this.userService.createUser(
      body.email,
      body.password,
      body.roleSlug || 'SECRETARY',
      req.user.churchId,
      body.member,
    );
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update user (ADMIN only)',
    description: 'Updates data of an existing user. Requires ADMIN role.'
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateMemberDto })
  @ApiResponse({ status: 200, description: 'User updated', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'No permission' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateMemberDto,
    @Request() req,
  ): Promise<UserResponseDto> {
    if (req.user?.role?.slug !== 'ADMIN') {
      throw new NoAccessPermissionError();
    }
    return await this.userService.updateUser(id, body);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete user (ADMIN only)',
    description: 'Permanently removes a user. Requires ADMIN role.'
  })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User deleted',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 403, description: 'No permission' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    if (req.user?.role?.slug !== 'ADMIN') {
      throw new NoAccessPermissionError();
    }
    await this.userService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }
}
