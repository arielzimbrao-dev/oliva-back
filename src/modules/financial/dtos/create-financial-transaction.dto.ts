import { IsNotEmpty, IsString, IsEnum, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { FinancialTransactionType } from '../../../entities/financial-transaction.entity';
import { RecurrenceFrequency } from 'src/entities/recurring-payment.entity';

export class CreateFinancialTransactionDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsEnum(FinancialTransactionType)
  type: FinancialTransactionType;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsEnum(RecurrenceFrequency)
  recurrenceFrequency?: RecurrenceFrequency;
}
