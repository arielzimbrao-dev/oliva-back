import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { IsPublic } from './jwt/is-public.decoretor';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @IsPublic()
  @ApiOperation({ 
    summary: 'Login de usuário',
    description: 'Autentica um usuário com email e senha e retorna tokens de acesso'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciais inválidas'
  })
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  @IsPublic()
  @ApiOperation({ 
    summary: 'Renovar token de acesso',
    description: 'Gera um novo access token usando o refresh token'
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Token renovado com sucesso',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Refresh token inválido ou expirado'
  })
  async refresh(@Body() body: RefreshTokenDto): Promise<LoginResponseDto> {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('forgot-password')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Solicitar recuperação de senha',
    description: 'Envia email com link para redefinição de senha. Email é enviado no idioma configurado na igreja.'
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Email de recuperação enviado com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email de recuperação enviado com sucesso. Verifique sua caixa de entrada.' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Usuário não encontrado ou não está ativo'
  })
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Redefinir senha',
    description: 'Redefine a senha do usuário usando o token recebido por email. O token expira em 1 hora.'
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Senha alterada com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Senha alterada com sucesso' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Token inválido ou expirado'
  })
  async resetPassword(@Body() body: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
    return this.authService.resetPassword(body.token, body.password);
  }
}
