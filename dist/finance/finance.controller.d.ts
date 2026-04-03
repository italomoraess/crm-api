import { FinanceService } from './finance.service';
import { CreateFinanceCategoryDto } from './dto/create-finance-category.dto';
import { UpdateFinanceCategoryDto } from './dto/update-finance-category.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { TransactionType } from '@prisma/client';
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    findAllCategories(user: {
        userId: string;
    }, type?: TransactionType): Promise<({
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
    createCategory(user: {
        userId: string;
    }, dto: CreateFinanceCategoryDto): Promise<{
        type: import("@prisma/client").$Enums.TransactionType;
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        color: string | null;
    }>;
    updateCategory(user: {
        userId: string;
    }, id: string, dto: UpdateFinanceCategoryDto): Promise<{
        type: import("@prisma/client").$Enums.TransactionType;
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        color: string | null;
    }>;
    removeCategory(user: {
        userId: string;
    }, id: string): Promise<{
        type: import("@prisma/client").$Enums.TransactionType;
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
        color: string | null;
    }>;
    findAllTransactions(user: {
        userId: string;
    }, query: QueryTransactionsDto): Promise<({
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
        amount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    createTransaction(user: {
        userId: string;
    }, dto: CreateTransactionDto): Promise<{
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
        amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateTransaction(user: {
        userId: string;
    }, id: string, dto: UpdateTransactionDto): Promise<{
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
        amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    removeTransaction(user: {
        userId: string;
    }, id: string): Promise<{
        type: import("@prisma/client").$Enums.TransactionType;
        description: string | null;
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        categoryId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
    }>;
    getSummary(user: {
        userId: string;
    }, month?: string, year?: string): Promise<{
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
}
