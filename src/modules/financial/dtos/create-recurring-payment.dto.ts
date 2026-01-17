import { IsNotEmpty, IsString, IsEnum, IsDateString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { RecurrenceFrequency } from '../../../entities/recurring-payment.entity';
import { FinancialTransactionType } from '../../../entities/financial-transaction.entity';

export class CreateRecurringPaymentDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsEnum(FinancialTransactionType)
  type: FinancialTransactionType;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(RecurrenceFrequency)
  frequency: RecurrenceFrequency;

  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
