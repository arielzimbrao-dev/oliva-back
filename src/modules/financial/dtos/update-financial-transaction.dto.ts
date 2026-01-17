import { IsOptional, IsString, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FinancialTransactionType } from '../../../entities/financial-transaction.entity';
import { RecurrenceFrequency } from '../../../entities/recurring-payment.entity';

export class UpdateFinancialTransactionDto {
  @ApiProperty({ example: '2024-01-15', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: 'Dízimo da família Silva', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Dízimos', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ enum: FinancialTransactionType, example: 'INCOME', required: false })
  @IsOptional()
  @IsEnum(FinancialTransactionType)
  type?: FinancialTransactionType;

  @ApiProperty({ example: 500.00, required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ enum: RecurrenceFrequency, required: false, example: 'MONTHLY' })
  @IsOptional()
  @IsEnum(RecurrenceFrequency)
  recurrenceType?: RecurrenceFrequency;
}
