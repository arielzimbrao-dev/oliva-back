import { IsNotEmpty, IsString, IsEnum, IsDateString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecurrenceFrequency } from '../../../entities/recurring-payment.entity';
import { FinancialTransactionType } from '../../../entities/financial-transaction.entity';

export class CreateRecurringPaymentDto {
  @ApiProperty({ example: 'Aluguel da igreja' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'Despesas fixas' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ enum: FinancialTransactionType, example: 'EXPENSE' })
  @IsNotEmpty()
  @IsEnum(FinancialTransactionType)
  type: FinancialTransactionType;

  @ApiProperty({ example: 1500.00 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: RecurrenceFrequency, example: 'MONTHLY' })
  @IsNotEmpty()
  @IsEnum(RecurrenceFrequency)
  frequency: RecurrenceFrequency;

  @ApiProperty({ example: '2024-01-01' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
