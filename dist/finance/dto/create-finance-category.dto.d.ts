import { TransactionType } from '@prisma/client';
export declare class CreateFinanceCategoryDto {
    name: string;
    type: TransactionType;
    color?: string;
}
