import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateMemberDto } from './create-member.dto';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario@igreja.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SenhaSegura123!' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'MEMBER', required: false })
  @IsOptional()
  @IsString()
  roleSlug?: string;

  @ApiProperty({ type: CreateMemberDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateMemberDto)
  member: CreateMemberDto;
}
