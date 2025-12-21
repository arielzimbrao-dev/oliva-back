import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength, ValidateNested, IsOptional, IsUUID, IsBoolean, IsDateString, IsPhoneNumber } from 'class-validator';

export class CredentialsDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(6)
  passwordConfirmation: string;
}

export class ProfileDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsDateString()
  birthDate: string;

  @IsString()
  gender: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsBoolean()
  baptized: boolean;
}

export class AddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class ChurchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsDateString()
  foundationDate?: string;

  @IsString()
  preferredLanguage: string;

  @IsString()
  preferredCurrency: string;
}

export class PlanDto {
  @IsUUID()
  planId: string;

  @IsOptional()
  @IsBoolean()
  freeTrial?: boolean;
}

export class RegisterChurchDto {
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

export class RegisterChurchResultDto {
  accessToken: string;
  refreshToken: string;
  user: any;
  member: any;
  church: any;
  subscription: any;
}
