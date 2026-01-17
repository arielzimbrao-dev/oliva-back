import type { Response } from 'express';
import { Res } from '@nestjs/common';
import { Controller, Post, Get, Put, Delete, Param, Body, Query, DefaultValuePipe, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { FinancialTransactionService } from './financial-transaction.service';
import { CreateFinancialTransactionDto } from './dtos/create-financial-transaction.dto';
import { UpdateFinancialTransactionDto } from './dtos/update-financial-transaction.dto';
import { FinancialTransactionResponseDto, FinancialTransactionListResponseDto } from './dtos/financial-transaction-response.dto';
import { ChurchRepository } from 'src/entities/repository/church.repository';
import { Church } from 'src/entities/church.entity';
import { JwtAuthGuard } from '../auth/jwt/jwt.auth.guard';

@ApiTags('Financial Transactions')
@Controller('financial-transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FinancialTransactionController {
  constructor(private readonly service: FinancialTransactionService, private readonly churchRepository: ChurchRepository) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create financial transaction',
    description: 'Creates a new income or expense transaction'
  })
  @ApiBody({ type: CreateFinancialTransactionDto })
  @ApiResponse({ status: 201, description: 'Transaction created', type: FinancialTransactionResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreateFinancialTransactionDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'List financial transactions',
    description: 'Lists all transactions with pagination and filters'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'type', required: false, description: 'Transaction type (INCOME/EXPENSE)' })
  @ApiQuery({ name: 'category', required: false, description: 'Category filter' })
  @ApiQuery({ name: 'description', required: false, description: 'Description filter' })
  @ApiResponse({ status: 200, description: 'List of transactions', type: FinancialTransactionListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('category') category?: string[],
    @Query('description') description?: string
  ): Promise<FinancialTransactionListResponseDto> {
    return this.service.findAll(page, limit, startDate, endDate, type, category, description);
  }

  @Get('export')
  @ApiOperation({ 
    summary: 'Export transactions to CSV',
    description: 'Exports filtered transactions in CSV format'
  })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'type', required: false, description: 'Transaction type' })
  @ApiQuery({ name: 'category', required: false, description: 'Category filter' })
  @ApiQuery({ name: 'description', required: false, description: 'Description filter' })
  @ApiResponse({ status: 200, description: 'CSV file', content: { 'text/csv': {} } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async exportCSV(
    @Res() res: Response,
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: string,
    @Query('category') category?: string[],
    @Query('description') description?: string,
  ) {
    const items = await this.service.findAllNoPagination(startDate, endDate, type, category, req.user.churchId, description);
    // Buscar idioma e moeda da igreja
    let churchLang = 'pt';
    let currency = 'BRL';
    let church: Church | null = null;
    if (req.user && req.user.churchId) {
      church = await this.churchRepository.findOneById(req.user.churchId);
      if (church) {
        if (church.preferredLanguage) {
          churchLang = church.preferredLanguage.toLowerCase();
        }
        if (church.preferredCurrency) {
          currency = church.preferredCurrency;
        }
      }
    }
    let header = 'Data,Description,Tipo,Categoria,Valor\n';
    if (churchLang.startsWith('es')) header = 'Fecha,Descripción,Tipo,Categoría,Valor\n';
    else if (churchLang.startsWith('en')) header = 'Date,Description,Type,Category,Value\n';
    else if (churchLang.startsWith('fr')) header = 'Date,Description,Type,Catégorie,Valeur\n';

    let formatter;
    try {
      formatter = new Intl.NumberFormat(churchLang.replace('-', '_'), { style: 'currency', currency });
    } catch {
      formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const rows = items.map(item => [
      item.date,
      '"' + (item.description || '').replace(/"/g, '""') + '"',
      item.type,
      '"' + (item.category || '').replace(/"/g, '""') + '"',
      formatter.format(item.amount)
    ].join(','));
    const csv = header + rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csv);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FinancialTransactionResponseDto> {
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateFinancialTransactionDto): Promise<FinancialTransactionResponseDto> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.softDelete(id);
  }
}
