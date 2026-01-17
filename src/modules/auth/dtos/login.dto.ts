import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    example: 'usuario@igreja.com',
    description: 'User email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'senha123',
    description: 'User password'
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
