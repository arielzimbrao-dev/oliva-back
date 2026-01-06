import { FinancialTransactionType, RecurrenceType } from '../../../entities/financial-transaction.entity';

export class FinancialTransactionResponseDto {
  id: string;
  date: string;
  description: string;
  category: string;
  type: FinancialTransactionType;
  amount: number;
  isPaid: boolean;
  recurrenceType: RecurrenceType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class FinancialTransactionListResponseDto {
  total: number;
  page: number;
  limit: number;
  resume: {
    incomeTotal: {
      total: number;
      efective: number;
    }; //Total de receitas no periodo filtrado. soma de todas as transações do tipo INCOME. 'efective' soma apenas transações isPaid: true
    expenseTotal: {
      total: number;
      efective: number;
    }; //Total de despesas no periodo filtrado. soma de todas as transações do tipo EXPENSE. 'efective' soma apenas transações isPaid: true
    balance: {
      total: number;
      efective: number;
    }; //Saldo no periodo filtrado. incomeTotal - expenseTotal. 'efective' soma apenas transações isPaid: true
    currentBalance: number; //Saldo atual considerando todas as transações pagas cadastradas no sistema para a church filtrada
  };
  data: FinancialTransactionResponseDto[];
}
