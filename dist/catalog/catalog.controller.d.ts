import { CatalogService } from './catalog.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateLeadProductDto } from './dto/create-lead-product.dto';
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    findAllCategories(user: {
        userId: string;
    }): Promise<({
        _count: {
            products: number;
        };
    } & {
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
    })[]>;
    createCategory(user: {
        userId: string;
    }, dto: CreateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
    }>;
    updateCategory(user: {
        userId: string;
    }, id: string, dto: UpdateCategoryDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
    }>;
    removeCategory(user: {
        userId: string;
    }, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        userId: string;
    }>;
    findAllProducts(user: {
        userId: string;
    }): Promise<({
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
    createProduct(user: {
        userId: string;
    }, dto: CreateProductDto): Promise<{
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
    updateProduct(user: {
        userId: string;
    }, id: string, dto: UpdateProductDto): Promise<{
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
    removeProduct(user: {
        userId: string;
    }, id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        categoryId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        durationDays: number | null;
    }>;
    createLeadProduct(user: {
        userId: string;
    }, leadId: string, dto: CreateLeadProductDto): Promise<{
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
    findLeadProducts(user: {
        userId: string;
    }, leadId: string): Promise<({
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
}
