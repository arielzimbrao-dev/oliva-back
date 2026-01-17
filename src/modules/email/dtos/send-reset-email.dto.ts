import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendResetEmailDto {
  @ApiProperty({ 
    example: 'usuario@igreja.com',
    description: 'Email do usuário'
  })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;
}
