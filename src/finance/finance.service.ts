import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFinanceCategoryDto } from './dto/create-finance-category.dto';
import { UpdateFinanceCategoryDto } from './dto/update-finance-category.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { Prisma, TransactionType } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ─── Categories ─────────────────────────────────────────────────────

  async findAllCategories(userId: string, type?: TransactionType) {
    const where: Prisma.FinanceCategoryWhereInput = { userId };
    if (type) where.type = type;

    return this.prisma.financeCategory.findMany({
      where,
      include: { _count: { select: { transactions: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(userId: string, dto: CreateFinanceCategoryDto) {
    return this.prisma.financeCategory.create({
      data: { ...dto, userId },
    });
  }

  async updateCategory(
    userId: string,
    id: string,
    dto: UpdateFinanceCategoryDto,
  ) {
    await this.verifyCategoryOwnership(userId, id);
    return this.prisma.financeCategory.update({
      where: { id },
      data: dto,
    });
  }

  async removeCategory(userId: string, id: string) {
    await this.verifyCategoryOwnership(userId, id);
    return this.prisma.financeCategory.delete({ where: { id } });
  }

  // ─── Transactions ──────────────────────────────────────────────────

  async findAllTransactions(userId: string, query: QueryTransactionsDto) {
    const where: Prisma.TransactionWhereInput = { userId };

    if (query.type) where.type = query.type;
    if (query.categoryId) where.categoryId = query.categoryId;

    if (query.month && query.year) {
      const startOfMonth = new Date(query.year, query.month - 1, 1);
      const endOfMonth = new Date(query.year, query.month, 0);
      where.date = { gte: startOfMonth, lte: endOfMonth };
    } else if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) where.date.lte = new Date(query.to);
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, type: true, color: true } },
      },
      orderBy: { date: 'desc' },
    });
  }

  async createTransaction(userId: string, dto: CreateTransactionDto) {
    // Verify category belongs to user and type matches
    const category = await this.verifyCategoryOwnership(userId, dto.categoryId);

    if (category.type !== dto.type) {
      throw new BadRequestException(
        `Transaction type "${dto.type}" does not match category type "${category.type}"`,
      );
    }

    return this.prisma.transaction.create({
      data: {
        userId,
        categoryId: dto.categoryId,
        type: dto.type,
        amount: dto.amount,
        date: new Date(dto.date),
        description: dto.description,
      },
      include: {
        category: { select: { id: true, name: true, type: true, color: true } },
      },
    });
  }

  async updateTransaction(
    userId: string,
    id: string,
    dto: UpdateTransactionDto,
  ) {
    await this.verifyTransactionOwnership(userId, id);

    if (dto.categoryId) {
      const category = await this.verifyCategoryOwnership(
        userId,
        dto.categoryId,
      );
      if (dto.type && category.type !== dto.type) {
        throw new BadRequestException(
          `Transaction type "${dto.type}" does not match category type "${category.type}"`,
        );
      }
    }

    const data: Record<string, unknown> = {};
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.type !== undefined) data.type = dto.type;
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.date !== undefined) data.date = new Date(dto.date);
    if (dto.description !== undefined) data.description = dto.description;

    return this.prisma.transaction.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, type: true, color: true } },
      },
    });
  }

  async removeTransaction(userId: string, id: string) {
    await this.verifyTransactionOwnership(userId, id);
    return this.prisma.transaction.delete({ where: { id } });
  }

  // ─── Summary ────────────────────────────────────────────────────────

  async getSummary(userId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month ?? now.getMonth() + 1;
    const targetYear = year ?? now.getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0);

    const dateFilter: Prisma.TransactionWhereInput = {
      userId,
      date: { gte: startOfMonth, lte: endOfMonth },
    };

    // Get income total
    const incomeAgg = await this.prisma.transaction.aggregate({
      where: { ...dateFilter, type: 'entrada' },
      _sum: { amount: true },
    });

    // Get expense total
    const expenseAgg = await this.prisma.transaction.aggregate({
      where: { ...dateFilter, type: 'saida' },
      _sum: { amount: true },
    });

    const totalIncome = Number(incomeAgg._sum.amount ?? 0);
    const totalExpense = Number(expenseAgg._sum.amount ?? 0);

    // Group by category
    const byCategory = await this.prisma.transaction.groupBy({
      by: ['categoryId', 'type'],
      where: dateFilter,
      _sum: { amount: true },
    });

    // Fetch category names
    const categoryIds = byCategory.map((g) => g.categoryId);
    const categories = await this.prisma.financeCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, type: true, color: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const byCategoryResult = byCategory.map((g) => {
      const cat = categoryMap.get(g.categoryId);
      return {
        categoryId: g.categoryId,
        categoryName: cat?.name ?? 'Unknown',
        type: g.type,
        color: cat?.color ?? null,
        total: Number(g._sum.amount ?? 0),
      };
    });

    return {
      month: targetMonth,
      year: targetYear,
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense,
      by_category: byCategoryResult,
    };
  }

  // ─── Ownership Helpers ─────────────────────────────────────────────

  private async verifyCategoryOwnership(userId: string, id: string) {
    const category = await this.prisma.financeCategory.findUnique({
      where: { id },
    });
    if (!category) throw new NotFoundException('Finance category not found');
    if (category.userId !== userId)
      throw new ForbiddenException('Access denied');
    return category;
  }

  private async verifyTransactionOwnership(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });
    if (!transaction) throw new NotFoundException('Transaction not found');
    if (transaction.userId !== userId)
      throw new ForbiddenException('Access denied');
    return transaction;
  }
}
