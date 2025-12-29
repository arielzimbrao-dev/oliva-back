import { IsOptional, IsString } from 'class-validator';

export class UpdateChurchDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  preferredCurrency?: string;
}
