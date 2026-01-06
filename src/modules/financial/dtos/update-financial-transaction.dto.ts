import { IsOptional, IsString, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { FinancialTransactionType, RecurrenceType } from '../../../entities/financial-transaction.entity';

export class UpdateFinancialTransactionDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(FinancialTransactionType)
  type?: FinancialTransactionType;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(RecurrenceType)
  recurrenceType?: RecurrenceType;
}
