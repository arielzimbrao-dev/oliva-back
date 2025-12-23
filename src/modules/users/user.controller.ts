import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt/jwt.auth.guard';
import { NoAccessPermissionError } from 'src/common/exceptions/exception';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async listUsers(@Request() req) {
    // Verificar se é admin
    if (req.user?.role?.slug !== 'ADMIN') {
      throw new NoAccessPermissionError();
    }
    return await this.userService.listUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string, @Request() req) {
    // Verificar se é admin
    if (req.user?.role?.slug !== 'ADMIN') {
      throw new NoAccessPermissionError();
    }
    return await this.userService.getUserById(id);
  }

  @Post()
  async createUser(
    @Body() body: { email: string; password: string; roleSlug?: string },
    @Request() req,
  ) {
    // Verificar se é admin
    if (req.user?.role?.slug !== 'ADMIN') {
      throw new NoAccessPermissionError();
    }
    return await this.userService.createUser(
      body.email,
      body.password,
      body.roleSlug || 'SECRETARY',
      req.user.churchId,
    );
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: { email?: string; state?: string; roleSlug?: string },
    @Request() req,
  ) {
    // Verificar se é admin
    if (req.user?.role?.slug !== 'ADMIN') {
      throw new NoAccessPermissionError();
    }
    return await this.userService.updateUser(id, body);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Request() req) {
    // Verificar se é admin
    if (req.user?.role?.slug !== 'ADMIN') {
      throw new NoAccessPermissionError();
    }
    await this.userService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }
}
