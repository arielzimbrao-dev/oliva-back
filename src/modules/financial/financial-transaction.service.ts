import { Injectable, NotFoundException } from '@nestjs/common';
import { FinancialTransaction } from '../../entities/financial-transaction.entity';
import { FinancialTransactionRepository } from '../../entities/repository/financial-transaction.repository';
import { RecurringPaymentRepository } from '../../entities/repository/recurring-payment.repository';
import { CreateFinancialTransactionDto } from './dtos/create-financial-transaction.dto';
import { UpdateFinancialTransactionDto } from './dtos/update-financial-transaction.dto';
import { FinancialTransactionResponseDto, FinancialTransactionListResponseDto } from './dtos/financial-transaction-response.dto';
import { RecurrenceFrequency } from '../../entities/recurring-payment.entity';

interface CreateRecurringPaymentDto {
  description: string;
  category: string;
  type: any;
  amount: number;
  frequency: RecurrenceFrequency;
  startDate: string;
  endDate?: string;
  isActive?: boolean;
}

@Injectable()
export class FinancialTransactionService {
  constructor(
    private readonly repo: FinancialTransactionRepository,
    private readonly recurringRepo: RecurringPaymentRepository,
  ) {}

  async create(dto: CreateFinancialTransactionDto): Promise<any> {
    // Se recurrenceFrequency foi fornecido, criar como recorrente
    if (dto.recurrenceFrequency) {
      const recurringDto: CreateRecurringPaymentDto = {
        description: dto.description || '',
        category: dto.category,
        type: dto.type,
        amount: dto.amount,
        frequency: dto.recurrenceFrequency,
        startDate: dto.date,
        isActive: true,
      };
      return this.createRecurring(recurringDto);
    }
    
    // Caso contrário, criar transação normal
    const entity = await this.repo.create(dto);
    return this.toResponseDto(entity);
  }

  async findAll(page = 1, limit = 10, startDate?: string, endDate?: string, type?: string, category?: string[], description?: string): Promise<FinancialTransactionListResponseDto> {
    // Monta filtro dinâmico
    const { Between, IsNull, Like } = require('typeorm');
    const where: any = { deletedAt: IsNull() };
    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = Between(startDate, new Date().toISOString().slice(0, 10));
    } else if (endDate) {
      where.date = Between('1900-01-01', endDate);
    }
    if (type) {
      where.type = type;
    }
    if (category && Array.isArray(category) && category.length > 0) {
      where.category = category.length === 1 ? category[0] : category;
    }
    if (description && description.trim() !== '') {
      where.description = Like(`%${description}%`);
    }
    const { data, total } = await this.repo.findPaginated({ page, limit, where });

    // Usa a query customizada do repositório para o resumo
    const resumeRaw = await this.repo.getResume({ startDate, endDate, type, category });

    // Preencher todos os campos do resume, retornando 0 se não houver dados
    const resume = {
      incomeTotal: {
        total: resumeRaw?.incomeTotal?.total ?? 0,
        efective: resumeRaw?.incomeTotal?.efective ?? 0,
      },
      expenseTotal: {
        total: resumeRaw?.expenseTotal?.total ?? 0,
        efective: resumeRaw?.expenseTotal?.efective ?? 0,
      },
      balance: {
        total: resumeRaw?.balance?.total ?? 0,
        efective: resumeRaw?.balance?.efective ?? 0,
      },
      currentBalance: resumeRaw?.currentBalance ?? 0,
    };

    return {
      total,
      page,
      limit,
      resume,
      data: data.map((item: FinancialTransaction) => this.toResponseDto(item)),
    };
  }

  async findOne(id: string): Promise<FinancialTransactionResponseDto> {
    const entity = await this.repo.findOne({ where: { id, deletedAt: undefined } });
    if (!entity) throw new NotFoundException('Transaction not found');
    return this.toResponseDto(entity);
  }

  async update(id: string, dto: UpdateFinancialTransactionDto): Promise<FinancialTransactionResponseDto> {
    const entity = await this.repo.findOne({ where: { id, deletedAt: undefined } });
    if (!entity) throw new NotFoundException('Transaction not found');
    // Corrigir recurrenceType inválido
    const validRecurrenceTypes = [
      'ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'
    ];
    let recurrenceType = dto.recurrenceType as any;
    if (!recurrenceType || !validRecurrenceTypes.includes(recurrenceType)) {
      recurrenceType = 'ONE_TIME';
    }
    Object.assign(entity, { ...dto, recurrenceType });
    entity.updatedAt = new Date();
    const saved = await this.repo.save(entity);
    return this.toResponseDto(saved);
  }

  async softDelete(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id, deletedAt: undefined } });
    if (!entity) throw new NotFoundException('Transaction not found');
    entity.deletedAt = new Date();
    await this.repo.save(entity);
  }

    async findAllNoPagination(startDate?: string, endDate?: string, type?: string, category?: string[], churchId?: string, description?: string): Promise<FinancialTransaction[]> {
      const { Between, IsNull, Like } = require('typeorm');
      const where: any = { deletedAt: IsNull() };
      if (startDate && endDate) {
        where.date = Between(startDate, endDate);
      } else if (startDate) {
        where.date = Between(startDate, new Date().toISOString().slice(0, 10));
      } else if (endDate) {
        where.date = Between('1900-01-01', endDate);
      }
      if (type) {
        where.type = type;
      }
      if (category && Array.isArray(category) && category.length > 0) {
        where.category = category.length === 1 ? category[0] : category;
      }
      if (description && description.trim() !== '') {
        where.description = Like(`%${description}%`);
      }
      return this.repo.findAll({ where });
    }

  async createRecurring(dto: CreateRecurringPaymentDto): Promise<{ recurringPayment: any; generatedTransactions: FinancialTransactionResponseDto[] }> {
    // Criar o pagamento recorrente
    const recurringPayment = await this.recurringRepo.create(dto);

    // Gerar transações para 1 ano à frente
    const transactions = await this.generateRecurringTransactions(recurringPayment);

    // Atualizar lastGeneratedDate
    const lastDate = transactions[transactions.length - 1]?.date;
    if (lastDate) {
      recurringPayment.lastGeneratedDate = lastDate;
      await this.recurringRepo.save(recurringPayment);
    }

    return {
      recurringPayment,
      generatedTransactions: transactions,
    };
  }

  private async generateRecurringTransactions(recurringPayment: any): Promise<FinancialTransactionResponseDto[]> {
    const transactions: FinancialTransactionResponseDto[] = [];
    const startDate = new Date(recurringPayment.startDate);
    const currentDate = new Date(startDate);
    
    // Calcular quantas transações gerar
    let occurrences = 12; // Default para MONTHLY
    switch (recurringPayment.frequency) {
      case RecurrenceFrequency.DAILY:
        occurrences = 365;
        break;
      case RecurrenceFrequency.WEEKLY:
        occurrences = 52;
        break;
      case RecurrenceFrequency.MONTHLY:
        occurrences = 12;
        break;
      case RecurrenceFrequency.YEARLY:
        occurrences = 1;
        break;
    }

    for (let i = 0; i < occurrences; i++) {
      const transactionDate = new Date(currentDate);
      
      // Criar a transação
      const transaction = await this.repo.create({
        date: transactionDate.toISOString().split('T')[0],
        description: recurringPayment.description,
        category: recurringPayment.category,
        type: recurringPayment.type,
        amount: recurringPayment.amount,
        isPaid: i === 0, // Primeira transação marcada como paga, demais como não pagas
        recurringPaymentId: recurringPayment.id,
        isActive: true,
      });

      transactions.push(this.toResponseDto(transaction));

      // Avançar para a próxima data
      switch (recurringPayment.frequency) {
        case RecurrenceFrequency.DAILY:
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case RecurrenceFrequency.WEEKLY:
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case RecurrenceFrequency.MONTHLY:
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        case RecurrenceFrequency.YEARLY:
          currentDate.setFullYear(currentDate.getFullYear() + 1);
          break;
      }
    }

    return transactions;
  }

  private toResponseDto(entity: FinancialTransaction): FinancialTransactionResponseDto {
    return {
      id: entity.id,
      date: entity.date,
      description: entity.description,
      category: entity.category,
      type: entity.type,
      amount: Number(entity.amount),
      isPaid: entity.isPaid ?? false,
      isActive: entity.isActive ?? true,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
