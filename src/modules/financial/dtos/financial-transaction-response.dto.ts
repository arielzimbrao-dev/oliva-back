import { FinancialTransactionType } from '../../../entities/financial-transaction.entity';

export class FinancialTransactionResponseDto {
  id: string;
  date: string;
  description: string;
  category: string;
  type: FinancialTransactionType;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export class FinancialTransactionListResponseDto {
  total: number;
  page: number;
  limit: number;
  resume: {
    incomeTotal: number; //Total de receitas no periodo filtrado. soma de todas as transações do tipo INCOME
    expenseTotal: number; //Total de despesas no periodo filtrado. soma de todas as transações do tipo EXPENSE
    balance: number; //Saldo no periodo filtrado. incomeTotal - expenseTotal
    currentBalance: number; //Saldo atual considerando todas as transações cadastradas no sistema para a church filtrada
  };
  data: FinancialTransactionResponseDto[];
}
