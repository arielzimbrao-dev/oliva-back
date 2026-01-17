import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    example: 'usuario@igreja.com',
    description: 'Email do usuário'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'senha123',
    description: 'Senha do usuário'
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
