import { ApiProperty } from '@nestjs/swagger';
import { RecurrenceFrequency } from '../../../entities/recurring-payment.entity';

export class RecurringPaymentResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Aluguel da igreja' })
  description: string;

  @ApiProperty({ example: 'Despesas fixas' })
  category: string;

  @ApiProperty({ example: 'EXPENSE' })
  type: string;

  @ApiProperty({ example: 1500.00 })
  amount: number;

  @ApiProperty({ enum: RecurrenceFrequency, example: 'MONTHLY' })
  frequency: RecurrenceFrequency;

  @ApiProperty({ example: '2024-01-01' })
  startDate: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  endDate?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-06-01', required: false })
  lastGeneratedDate?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class RecurringPaymentListResponseDto {
  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ type: [RecurringPaymentResponseDto] })
  data: RecurringPaymentResponseDto[];
}
