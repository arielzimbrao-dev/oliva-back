import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ 
    example: 'a1b2c3d4e5f6...',
    description: 'Token de recuperação recebido por email'
  })
  @IsNotEmpty({ message: 'Token é obrigatório' })
  @IsString()
  token: string;

  @ApiProperty({ 
    example: 'NovaSenha123!',
    description: 'Nova senha (mínimo 6 caracteres)'
  })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;
}
