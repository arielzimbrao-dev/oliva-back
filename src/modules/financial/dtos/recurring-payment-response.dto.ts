import { RecurrenceFrequency } from '../../../entities/recurring-payment.entity';

export class RecurringPaymentResponseDto {
  id: string;
  description: string;
  category: string;
  type: string;
  amount: number;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  lastGeneratedDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class RecurringPaymentListResponseDto {
  total: number;
  page: number;
  limit: number;
  data: RecurringPaymentResponseDto[];
}
