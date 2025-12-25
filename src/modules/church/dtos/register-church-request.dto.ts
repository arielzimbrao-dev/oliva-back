import { IsNotEmpty, IsString, IsEmail, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;
}

class ChurchProfileDto {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    birthDate?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    baptized?: boolean;
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsString()
  preferredCurrency?: string;
}

class CredentialsDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  passwordConfirmation: string;
}

class PlanDto {
  @IsNotEmpty()
  @IsString()
  planId: string;
}

export class RegisterChurchRequestDto {
  @ValidateNested()
  @Type(() => CredentialsDto)
  credentials: CredentialsDto;

  @ValidateNested()
  @Type(() => ChurchProfileDto)
  profile: ChurchProfileDto;

  @ValidateNested()
  @Type(() => PlanDto)
  plan: PlanDto;
}
