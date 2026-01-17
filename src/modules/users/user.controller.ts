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
    summary: 'Listar usuários (ADMIN only)',
    description: 'Lista todos os usuários da igreja com paginação e filtro. Requer role ADMIN.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página', example: 10 })
  @ApiQuery({ name: 'filter', required: false, type: String, description: 'Filtro de busca' })
  @ApiResponse({ status: 200, description: 'Lista de usuários', type: UserListResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão (não é ADMIN)' })
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
    summary: 'Obter usuário por ID (ADMIN only)',
    description: 'Retorna detalhes de um usuário específico. Requer role ADMIN.'
  })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Detalhes do usuário', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async getUserById(@Param('id') id: string, @Request() req): Promise<UserResponseDto> {
    if (req.user?.role?.slug !== 'ADMIN') {
      throw new NoAccessPermissionError();
    }
    return await this.userService.getUserById(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Criar novo usuário (ADMIN only)',
    description: 'Cria um novo usuário na igreja. Pode vincular a um membro existente. Requer role ADMIN.'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuário criado', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
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
    summary: 'Atualizar usuário (ADMIN only)',
    description: 'Atualiza dados de um usuário existente. Requer role ADMIN.'
  })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiBody({ type: UpdateMemberDto })
  @ApiResponse({ status: 200, description: 'Usuário atualizado', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
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
    summary: 'Deletar usuário (ADMIN only)',
    description: 'Remove um usuário permanentemente. Requer role ADMIN.'
  })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuário deletado',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User deleted successfully' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async deleteUser(@Param('id') id: string, @Request() req): Promise<{ message: string }> {
    if (req.user?.role?.slug !== 'ADMIN') {
      throw new NoAccessPermissionError();
    }
    await this.userService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }
}
