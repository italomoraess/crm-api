import { ServiceStatus } from '@prisma/client';
export declare class CreateProductDto {
    categoryId: string;
    name: string;
    price: number;
    durationDays?: number;
    duration?: string;
    description?: string;
    status?: ServiceStatus;
}
