import { IsNotEmpty, IsString, IsEnum, IsDateString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FinancialTransactionType } from '../../../entities/financial-transaction.entity';
import { RecurrenceFrequency } from 'src/entities/recurring-payment.entity';

export class CreateFinancialTransactionDto {
  @ApiProperty({ example: '2024-01-15', description: 'Data da transação' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Dízimo da família Silva', required: false })
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Dízimos' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ enum: FinancialTransactionType, example: 'INCOME' })
  @IsNotEmpty()
  @IsEnum(FinancialTransactionType)
  type: FinancialTransactionType;

  @ApiProperty({ example: 500.00 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: RecurrenceFrequency, required: false, example: 'MONTHLY' })
  @IsOptional()
  @IsEnum(RecurrenceFrequency)
  recurrenceFrequency?: RecurrenceFrequency;
}
