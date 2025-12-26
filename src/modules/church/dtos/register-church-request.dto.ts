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

class ProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  baptized?: boolean;
}

class ChurchDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsString()
  foundationDate?: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

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
  @Type(() => ProfileDto)
  profile: ProfileDto;

  @ValidateNested()
  @Type(() => ChurchDto)
  church: ChurchDto;

  @ValidateNested()
  @Type(() => PlanDto)
  plan: PlanDto;
}
