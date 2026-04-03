"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CatalogService = class CatalogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllCategories(userId) {
        return this.prisma.catalogCategory.findMany({
            where: { userId },
            include: { _count: { select: { products: true } } },
            orderBy: { name: 'asc' },
        });
    }
    async createCategory(userId, dto) {
        return this.prisma.catalogCategory.create({
            data: { ...dto, userId },
        });
    }
    async updateCategory(userId, id, dto) {
        await this.verifyCategoryOwnership(userId, id);
        return this.prisma.catalogCategory.update({
            where: { id },
            data: dto,
        });
    }
    async removeCategory(userId, id) {
        await this.verifyCategoryOwnership(userId, id);
        return this.prisma.catalogCategory.delete({ where: { id } });
    }
    async findAllProducts(userId) {
        return this.prisma.catalogProduct.findMany({
            where: { userId },
            include: { category: { select: { id: true, name: true } } },
            orderBy: { name: 'asc' },
        });
    }
    async createProduct(userId, dto) {
        await this.verifyCategoryOwnership(userId, dto.categoryId);
        return this.prisma.catalogProduct.create({
            data: {
                userId,
                categoryId: dto.categoryId,
                name: dto.name,
                price: dto.price,
                durationDays: dto.durationDays,
            },
            include: { category: { select: { id: true, name: true } } },
        });
    }
    async updateProduct(userId, id, dto) {
        await this.verifyProductOwnership(userId, id);
        if (dto.categoryId) {
            await this.verifyCategoryOwnership(userId, dto.categoryId);
        }
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.price !== undefined)
            data.price = dto.price;
        if (dto.durationDays !== undefined)
            data.durationDays = dto.durationDays;
        if (dto.categoryId !== undefined)
            data.categoryId = dto.categoryId;
        return this.prisma.catalogProduct.update({
            where: { id },
            data,
            include: { category: { select: { id: true, name: true } } },
        });
    }
    async removeProduct(userId, id) {
        await this.verifyProductOwnership(userId, id);
        return this.prisma.catalogProduct.delete({ where: { id } });
    }
    async createLeadProduct(userId, leadId, dto) {
        const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead || lead.deletedAt)
            throw new common_1.NotFoundException('Lead not found');
        if (lead.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        const product = await this.prisma.catalogProduct.findUnique({
            where: { id: dto.productId },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        const startDate = new Date(dto.startDate);
        let expiresAt = null;
        if (product.durationDays) {
            expiresAt = new Date(startDate);
            expiresAt.setDate(expiresAt.getDate() + product.durationDays);
        }
        return this.prisma.leadProduct.create({
            data: {
                leadId,
                productId: dto.productId,
                startDate,
                expiresAt,
            },
            include: {
                product: {
                    include: { category: { select: { id: true, name: true } } },
                },
            },
        });
    }
    async findLeadProducts(userId, leadId) {
        const lead = await this.prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead || lead.deletedAt)
            throw new common_1.NotFoundException('Lead not found');
        if (lead.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return this.prisma.leadProduct.findMany({
            where: { leadId },
            include: {
                product: {
                    include: { category: { select: { id: true, name: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async verifyCategoryOwnership(userId, id) {
        const category = await this.prisma.catalogCategory.findUnique({
            where: { id },
        });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        if (category.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return category;
    }
    async verifyProductOwnership(userId, id) {
        const product = await this.prisma.catalogProduct.findUnique({
            where: { id },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return product;
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map