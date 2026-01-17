import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { EmailService } from './email.service';
import { SendResetEmailDto } from './dtos/send-reset-email.dto';
import { IsPublic } from '../auth/jwt/is-public.decoretor';
import * as crypto from 'crypto';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly emailService: EmailService) {}

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ 
    summary: 'Enviar email de reset de senha (DEPRECATED)',
    description: 'DEPRECATED: Use /auth/forgot-password. Envia email com link para redefinição. Rate limit: 3 req/min. Sempre retorna sucesso por segurança.'
  })
  @ApiBody({ type: SendResetEmailDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Resposta padrão (não revela se email existe)',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        success: { type: 'boolean' }
      }
    }
  })
  async sendPasswordResetEmail(
    @Body() sendResetEmailDto: SendResetEmailDto,
  ): Promise<{ message: string; success: boolean }> {
    try {
      const { email } = sendResetEmailDto;

      // Generate secure reset token (32 bytes = 64 hex characters)
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Hash token for storage (should be saved in DB by AuthService)
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Build reset URL (expires in 1 hour)
      const frontendUrl = process.env.FRONTEND_URL || 'https://oliva.church';
      const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

      // Send email (service handles user lookup internally)
      const success = await this.emailService.sendPasswordReset(
        email,
        hashedToken,
        resetUrl,
      );

      // Always return success to prevent email enumeration
      // Actual failures are logged internally
      this.logger.log(`Password reset requested for email (masked in logs)`);

      return {
        message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.',
        success: true,
      };
    } catch (error) {
      this.logger.error('Error processing password reset request:', error.stack);
      
      // Don't leak error details to client
      return {
        message: 'Se o email existir em nossa base, você receberá instruções para redefinir sua senha.',
        success: true,
      };
    }
  }

  @Post('health')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @ApiOperation({ 
    summary: 'Verificar saúde do serviço de email',
    description: 'Endpoint de monitoramento para verificar se o serviço SMTP está operacional'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Status do serviço de email',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['operational', 'degraded'] },
        healthy: { type: 'boolean' }
      }
    }
  })
  async checkHealth(): Promise<{ status: string; healthy: boolean }> {
    const healthy = await this.emailService.isHealthy();
    return {
      status: healthy ? 'operational' : 'degraded',
      healthy,
    };
  }
}
