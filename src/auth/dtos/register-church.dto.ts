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

export class ChurchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  addressStreet?: string;

  @IsOptional()
  @IsString()
  addressNumber?: string;

  @IsOptional()
  @IsString()
  addressZipCode?: string;

  @IsOptional()
  @IsString()
  addressCity?: string;

  @IsOptional()
  @IsString()
  addressState?: string;

  @IsOptional()
  @IsString()
  addressCountry?: string;

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
