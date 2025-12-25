import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.auth.guard';
import { NoAccessPermissionError } from 'src/common/exceptions/exception';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateMemberDto } from './dtos/update-member.dto';
import { UserResponseDto, UserListResponseDto } from './dtos/user-response.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
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
  async getUserById(@Param('id') id: string, @Request() req): Promise<UserResponseDto> {
    if (req.user?.role?.slug !== 'ADMIN') {
      throw new NoAccessPermissionError();
    }
    return await this.userService.getUserById(id);
  }

  @Post()
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
  async deleteUser(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    if (req.user?.role?.slug !== 'ADMIN') {
      throw new NoAccessPermissionError();
    }
    await this.userService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }
}
