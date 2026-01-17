import { IsNotEmpty, IsString, IsEmail, ValidateNested, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class AddressDto {
  @ApiProperty({ example: 'Rua das Flores', required: false })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ example: '123', required: false })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiProperty({ example: 'São Paulo', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'SP', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: 'Brasil', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: '01234-567', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;
}

class ProfileDto {
  @ApiProperty({ example: 'João Silva', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: '1980-05-15', required: false })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiProperty({ example: 'M', required: false })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiProperty({ example: '+5511999999999', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  baptized?: boolean;
}

class ChurchDto {
  @ApiProperty({ example: 'Igreja Batista Central' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ type: AddressDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiProperty({ example: '2000-01-01', required: false })
  @IsOptional()
  @IsString()
  foundationDate?: string;

  @ApiProperty({ example: 'pt', required: false })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiProperty({ example: 'BRL', required: false })
  @IsOptional()
  @IsString()
  preferredCurrency?: string;
}

class CredentialsDto {
  @ApiProperty({ example: 'pastor@igreja.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SenhaSegura123!' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'SenhaSegura123!' })
  @IsNotEmpty()
  @IsString()
  passwordConfirmation: string;
}

class PlanDto {
  @ApiProperty({ example: 'uuid' })
  @IsNotEmpty()
  @IsString()
  planId: string;
}

export class RegisterChurchRequestDto {
  @ApiProperty({ type: CredentialsDto })
  @ValidateNested()
  @Type(() => CredentialsDto)
  credentials: CredentialsDto;

  @ApiProperty({ type: ProfileDto })
  @ValidateNested()
  @Type(() => ProfileDto)
  profile: ProfileDto;

  @ApiProperty({ type: ChurchDto })
  @ValidateNested()
  @Type(() => ChurchDto)
  church: ChurchDto;

  @ApiProperty({ type: PlanDto })
  @ValidateNested()
  @Type(() => PlanDto)
  plan: PlanDto;
}
