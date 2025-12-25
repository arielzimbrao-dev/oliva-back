
import { IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateMemberDto } from './create-member.dto';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  roleSlug?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateMemberDto)
  member: CreateMemberDto;
}
