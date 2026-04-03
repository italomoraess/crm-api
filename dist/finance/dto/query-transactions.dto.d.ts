import { TransactionType } from '@prisma/client';
export declare class QueryTransactionsDto {
    type?: TransactionType;
    categoryId?: string;
    from?: string;
    to?: string;
    month?: number;
    year?: number;
}
