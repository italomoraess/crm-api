import { TransactionType } from '@prisma/client';
export declare class CreateTransactionDto {
    categoryId: string;
    type: TransactionType;
    amount: number;
    date: string;
    description?: string;
}
