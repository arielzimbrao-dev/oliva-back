import { ApiProperty } from '@nestjs/swagger';
import { FinancialTransactionType } from '../../../entities/financial-transaction.entity';

export class FinancialTransactionResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: '2024-01-15' })
  date: string;

  @ApiProperty({ example: 'Dízimo da família Silva', required: false })
  description?: string;

  @ApiProperty({ example: 'Dízimos' })
  category: string;

  @ApiProperty({ enum: FinancialTransactionType, example: 'INCOME' })
  type: FinancialTransactionType;

  @ApiProperty({ example: 500.00 })
  amount: number;

  @ApiProperty({ example: true })
  isPaid: boolean;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FinancialTransactionListResponseDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({
    example: {
      incomeTotal: { total: 10000, efective: 8500 },
      expenseTotal: { total: 4000, efective: 3500 },
      balance: { total: 6000, efective: 5000 },
      currentBalance: 5000
    }
  })
  resume: {
    incomeTotal: {
      total: number;
      efective: number;
    };
    expenseTotal: {
      total: number;
      efective: number;
    };
    balance: {
      total: number;
      efective: number;
    };
    currentBalance: number;
  };

  @ApiProperty({ type: [FinancialTransactionResponseDto] })
  data: FinancialTransactionResponseDto[];
}
