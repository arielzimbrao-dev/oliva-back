import { IsNotEmpty, IsString, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { FinancialTransactionType } from '../../../entities/financial-transaction.entity';

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
}
