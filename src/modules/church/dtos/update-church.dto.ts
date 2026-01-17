import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateChurchDto {
  @ApiProperty({ example: 'Igreja Batista Central', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'pt', required: false })
  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @ApiProperty({ example: 'BRL', required: false })
  @IsOptional()
  @IsString()
  preferredCurrency?: string;
}
