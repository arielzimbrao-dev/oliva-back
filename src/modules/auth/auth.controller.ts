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
    summary: 'User login',
    description: 'Authenticates a user with email and password and returns access tokens'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials'
  })
  async login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  @IsPublic()
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Generates a new access token using the refresh token'
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid or expired refresh token'
  })
  async refresh(@Body() body: RefreshTokenDto): Promise<LoginResponseDto> {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('forgot-password')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Request password recovery',
    description: 'Sends an email with a password reset link. Email is sent in the church configured language.'
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Recovery email sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Email de recuperação enviado com sucesso. Verifique sua caixa de entrada.' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'User not found or not active'
  })
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reset password',
    description: 'Resets user password using the token received via email. Token expires in 1 hour.'
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Password changed successfully',
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
    description: 'Invalid or expired token'
  })
  async resetPassword(@Body() body: ResetPasswordDto): Promise<{ success: boolean; message: string }> {
    return this.authService.resetPassword(body.token, body.password);
  }
}
