import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateFinanceCategoryDto } from './dto/create-finance-category.dto';
import { UpdateFinanceCategoryDto } from './dto/update-finance-category.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TransactionType } from '@prisma/client';

@ApiTags('Finance')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ─── Categories ─────────────────────────────────────────────────────

  @Get('categories')
  @ApiOperation({ summary: 'List finance categories' })
  @ApiQuery({ name: 'type', enum: TransactionType, required: false })
  findAllCategories(
    @CurrentUser() user: { userId: string },
    @Query('type') type?: TransactionType,
  ) {
    return this.financeService.findAllCategories(user.userId, type);
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a finance category' })
  createCategory(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateFinanceCategoryDto,
  ) {
    return this.financeService.createCategory(user.userId, dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a finance category' })
  updateCategory(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateFinanceCategoryDto,
  ) {
    return this.financeService.updateCategory(user.userId, id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a finance category (cascades transactions)' })
  removeCategory(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.financeService.removeCategory(user.userId, id);
  }

  // ─── Transactions ──────────────────────────────────────────────────

  @Get('transactions')
  @ApiOperation({ summary: 'List transactions with filters' })
  findAllTransactions(
    @CurrentUser() user: { userId: string },
    @Query() query: QueryTransactionsDto,
  ) {
    return this.financeService.findAllTransactions(user.userId, query);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Create a transaction' })
  createTransaction(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateTransactionDto,
  ) {
    return this.financeService.createTransaction(user.userId, dto);
  }

  @Patch('transactions/:id')
  @ApiOperation({ summary: 'Update a transaction' })
  updateTransaction(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.financeService.updateTransaction(user.userId, id, dto);
  }

  @Delete('transactions/:id')
  @ApiOperation({ summary: 'Delete a transaction' })
  removeTransaction(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.financeService.removeTransaction(user.userId, id);
  }

  // ─── Summary ────────────────────────────────────────────────────────

  @Get('summary')
  @ApiOperation({ summary: 'Monthly financial summary (income, expense, balance, by category)' })
  @ApiQuery({ name: 'month', required: false, example: 4 })
  @ApiQuery({ name: 'year', required: false, example: 2026 })
  getSummary(
    @CurrentUser() user: { userId: string },
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.financeService.getSummary(
      user.userId,
      month ? parseInt(month, 10) : undefined,
      year ? parseInt(year, 10) : undefined,
    );
  }
}
