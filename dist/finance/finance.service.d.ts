import { PrismaService } from '../prisma/prisma.service';
import { CreateFinanceCategoryDto } from './dto/create-finance-category.dto';
import { UpdateFinanceCategoryDto } from './dto/update-finance-category.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { Prisma, TransactionType } from '@prisma/client';
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllCategories(userId: string, type?: TransactionType): Promise<({
        _count: {
            transactions: number;
        };
    } & {
        type: import("@prisma/client").$Enums.TransactionType;
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        color: string | null;
    })[]>;
    createCategory(userId: string, dto: CreateFinanceCategoryDto): Promise<{
        type: import("@prisma/client").$Enums.TransactionType;
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        color: string | null;
    }>;
    updateCategory(userId: string, id: string, dto: UpdateFinanceCategoryDto): Promise<{
        type: import("@prisma/client").$Enums.TransactionType;
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        color: string | null;
    }>;
    removeCategory(userId: string, id: string): Promise<{
        type: import("@prisma/client").$Enums.TransactionType;
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        color: string | null;
    }>;
    findAllTransactions(userId: string, query: QueryTransactionsDto): Promise<({
        category: {
            type: import("@prisma/client").$Enums.TransactionType;
            name: string;
            id: string;
            color: string | null;
        };
    } & {
        type: import("@prisma/client").$Enums.TransactionType;
        description: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        categoryId: string;
        amount: Prisma.Decimal;
    })[]>;
    createTransaction(userId: string, dto: CreateTransactionDto): Promise<{
        category: {
            type: import("@prisma/client").$Enums.TransactionType;
            name: string;
            id: string;
            color: string | null;
        };
    } & {
        type: import("@prisma/client").$Enums.TransactionType;
        description: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        categoryId: string;
        amount: Prisma.Decimal;
    }>;
    updateTransaction(userId: string, id: string, dto: UpdateTransactionDto): Promise<{
        category: {
            type: import("@prisma/client").$Enums.TransactionType;
            name: string;
            id: string;
            color: string | null;
        };
    } & {
        type: import("@prisma/client").$Enums.TransactionType;
        description: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        categoryId: string;
        amount: Prisma.Decimal;
    }>;
    removeTransaction(userId: string, id: string): Promise<{
        type: import("@prisma/client").$Enums.TransactionType;
        description: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        categoryId: string;
        amount: Prisma.Decimal;
    }>;
    getSummary(userId: string, month?: number, year?: number): Promise<{
        month: number;
        year: number;
        total_income: number;
        total_expense: number;
        balance: number;
        by_category: {
            categoryId: string;
            categoryName: string;
            type: import("@prisma/client").$Enums.TransactionType;
            color: string | null;
            total: number;
        }[];
    }>;
    private verifyCategoryOwnership;
    private verifyTransactionOwnership;
}
