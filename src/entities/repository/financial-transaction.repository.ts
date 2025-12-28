import { Between } from 'typeorm';
import { Injectable, Inject } from '@nestjs/common';
import { Repository, FindOneOptions, FindManyOptions, IsNull } from 'typeorm';
import { FinancialTransaction, FinancialTransactionType } from '../financial-transaction.entity';
import { BaseRepository } from '../../common/repository/base.repository';

@Injectable()
export class FinancialTransactionRepository {
  private base: BaseRepository<FinancialTransaction>;

  constructor(
    @Inject('FINANCIAL_TRANSACTION_REPOSITORY')
    private readonly repo: Repository<FinancialTransaction>,
  ) {
    this.base = new BaseRepository<FinancialTransaction>(this.repo);
  }

  findAll(options?: FindManyOptions<FinancialTransaction>) {
    return this.base.findAll(options);
  }



  findOne(options: FindOneOptions<FinancialTransaction>) {
    return this.base.findOne(options);
  }

  findOneById(id: string) {
    return this.base.findOneById(id);
  }

  create(entity: Partial<FinancialTransaction>) {
    return this.base.create(entity);
  }

  save(entity: FinancialTransaction) {
    return this.base.save(entity);
  }

  update(id: string, partial: Partial<FinancialTransaction>) {
    return this.base.update(id, partial);
  }

  softDelete(id: string) {
    return this.base.softDelete(id);
  }

  async findPaginated({ page = 1, limit = 10, where = {} }: { page?: number; limit?: number; where?: any }) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.repo.findAndCount({
      where: { ...where },
      order: { date: 'DESC' } as any,
      skip,
      take: limit,
    });
    return { data, total };
  }

  async getResume({ startDate, endDate, type, category }: { startDate?: string; endDate?: string; type?: string; category?: string[] }) {
    // Filtro de período e adicionais
    const wherePeriod: any = { deletedAt: IsNull() };
    if (startDate && endDate) {
      wherePeriod.date = Between(startDate, endDate);
    } else if (startDate) {
      wherePeriod.date = Between(startDate, new Date().toISOString().slice(0, 10));
    } else if (endDate) {
      wherePeriod.date = Between('1900-01-01', endDate);
    }
    if (type) {
      wherePeriod.type = type;
    }
    if (category && Array.isArray(category) && category.length > 0) {
      wherePeriod.category = category.length === 1 ? category[0] : category;
    }

    // Income/Expense total no período considerando filtro type
    let incomeTotal = 0;
    let expenseTotal = 0;
    if (type === FinancialTransactionType.INCOME) {
      incomeTotal = await this.repo.sum('amount', { ...wherePeriod, type: FinancialTransactionType.INCOME }) || 0;
      expenseTotal = 0;
    } else if (type === FinancialTransactionType.EXPENSE) {
      incomeTotal = 0;
      expenseTotal = await this.repo.sum('amount', { ...wherePeriod, type: FinancialTransactionType.EXPENSE }) || 0;
    } else {
      incomeTotal = await this.repo.sum('amount', { ...wherePeriod, type: FinancialTransactionType.INCOME }) || 0;
      expenseTotal = await this.repo.sum('amount', { ...wherePeriod, type: FinancialTransactionType.EXPENSE }) || 0;
    }
    const balance = Number(incomeTotal) - Number(expenseTotal);

    // Current balance (todas as transações, sem filtro de período/type/category)
    const allIncome = await this.repo.sum('amount', { deletedAt: IsNull(), type: FinancialTransactionType.INCOME });
    const allExpense = await this.repo.sum('amount', { deletedAt: IsNull(), type: FinancialTransactionType.EXPENSE });
    const currentBalance = Number(allIncome || 0) - Number(allExpense || 0);

    return {
      incomeTotal: Number(incomeTotal),
      expenseTotal: Number(expenseTotal),
      balance,
      currentBalance,
    };
  }
}
