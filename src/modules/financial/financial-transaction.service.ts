
import { Injectable, NotFoundException } from '@nestjs/common';
import { FinancialTransaction } from '../../entities/financial-transaction.entity';
import { FinancialTransactionRepository } from '../../entities/repository/financial-transaction.repository';
import { CreateFinancialTransactionDto } from './dtos/create-financial-transaction.dto';
import { UpdateFinancialTransactionDto } from './dtos/update-financial-transaction.dto';
import { FinancialTransactionResponseDto, FinancialTransactionListResponseDto } from './dtos/financial-transaction-response.dto';

@Injectable()
export class FinancialTransactionService {
  constructor(
    private readonly repo: FinancialTransactionRepository,
  ) {}

  async create(dto: CreateFinancialTransactionDto): Promise<FinancialTransactionResponseDto> {
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
    const resume = await this.repo.getResume({ startDate, endDate, type, category });

    return {
      total,
      page,
      limit,
      resume,
      data: data.map(this.toResponseDto),
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
    Object.assign(entity, dto);
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

  private toResponseDto(entity: FinancialTransaction): FinancialTransactionResponseDto {
    return {
      id: entity.id,
      date: entity.date,
      description: entity.description,
      category: entity.category,
      type: entity.type,
      amount: Number(entity.amount),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
