import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateLeadProductDto } from './dto/create-lead-product.dto';
export declare class CatalogService {
    private prisma;
    constructor(prisma: PrismaService);
    findAllCategories(userId: string): Promise<({
        _count: {
            products: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
    })[]>;
    createCategory(userId: string, dto: CreateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
    }>;
    updateCategory(userId: string, id: string, dto: UpdateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
    }>;
    removeCategory(userId: string, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
    }>;
    findAllProducts(userId: string): Promise<({
        category: {
            name: string;
            id: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categoryId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
    })[]>;
    createProduct(userId: string, dto: CreateProductDto): Promise<{
        category: {
            name: string;
            id: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categoryId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
    }>;
    updateProduct(userId: string, id: string, dto: UpdateProductDto): Promise<{
        category: {
            name: string;
            id: string;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categoryId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
    }>;
    removeProduct(userId: string, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categoryId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
    }>;
    createLeadProduct(userId: string, leadId: string, dto: CreateLeadProductDto): Promise<{
        product: {
            category: {
                name: string;
                id: string;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            categoryId: string;
            price: import("@prisma/client/runtime/library").Decimal;
            durationDays: number | null;
        };
    } & {
        id: string;
        createdAt: Date;
        expiresAt: Date | null;
        leadId: string;
        productId: string;
        startDate: Date;
    }>;
    findLeadProducts(userId: string, leadId: string): Promise<({
        product: {
            category: {
                name: string;
                id: string;
            };
        } & {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            categoryId: string;
            price: import("@prisma/client/runtime/library").Decimal;
            durationDays: number | null;
        };
    } & {
        id: string;
        createdAt: Date;
        expiresAt: Date | null;
        leadId: string;
        productId: string;
        startDate: Date;
    })[]>;
    private verifyCategoryOwnership;
    private verifyProductOwnership;
}
