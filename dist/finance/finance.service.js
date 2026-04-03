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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FinanceService = class FinanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllCategories(userId, type) {
        const where = { userId };
        if (type)
            where.type = type;
        return this.prisma.financeCategory.findMany({
            where,
            include: { _count: { select: { transactions: true } } },
            orderBy: { name: 'asc' },
        });
    }
    async createCategory(userId, dto) {
        return this.prisma.financeCategory.create({
            data: { ...dto, userId },
        });
    }
    async updateCategory(userId, id, dto) {
        await this.verifyCategoryOwnership(userId, id);
        return this.prisma.financeCategory.update({
            where: { id },
            data: dto,
        });
    }
    async removeCategory(userId, id) {
        await this.verifyCategoryOwnership(userId, id);
        return this.prisma.financeCategory.delete({ where: { id } });
    }
    async findAllTransactions(userId, query) {
        const where = { userId };
        if (query.type)
            where.type = query.type;
        if (query.categoryId)
            where.categoryId = query.categoryId;
        if (query.month && query.year) {
            const startOfMonth = new Date(query.year, query.month - 1, 1);
            const endOfMonth = new Date(query.year, query.month, 0);
            where.date = { gte: startOfMonth, lte: endOfMonth };
        }
        else if (query.from || query.to) {
            where.date = {};
            if (query.from)
                where.date.gte = new Date(query.from);
            if (query.to)
                where.date.lte = new Date(query.to);
        }
        return this.prisma.transaction.findMany({
            where,
            include: {
                category: { select: { id: true, name: true, type: true, color: true } },
            },
            orderBy: { date: 'desc' },
        });
    }
    async createTransaction(userId, dto) {
        const category = await this.verifyCategoryOwnership(userId, dto.categoryId);
        if (category.type !== dto.type) {
            throw new common_1.BadRequestException(`Transaction type "${dto.type}" does not match category type "${category.type}"`);
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
    async updateTransaction(userId, id, dto) {
        await this.verifyTransactionOwnership(userId, id);
        if (dto.categoryId) {
            const category = await this.verifyCategoryOwnership(userId, dto.categoryId);
            if (dto.type && category.type !== dto.type) {
                throw new common_1.BadRequestException(`Transaction type "${dto.type}" does not match category type "${category.type}"`);
            }
        }
        const data = {};
        if (dto.categoryId !== undefined)
            data.categoryId = dto.categoryId;
        if (dto.type !== undefined)
            data.type = dto.type;
        if (dto.amount !== undefined)
            data.amount = dto.amount;
        if (dto.date !== undefined)
            data.date = new Date(dto.date);
        if (dto.description !== undefined)
            data.description = dto.description;
        return this.prisma.transaction.update({
            where: { id },
            data,
            include: {
                category: { select: { id: true, name: true, type: true, color: true } },
            },
        });
    }
    async removeTransaction(userId, id) {
        await this.verifyTransactionOwnership(userId, id);
        return this.prisma.transaction.delete({ where: { id } });
    }
    async getSummary(userId, month, year) {
        const now = new Date();
        const targetMonth = month ?? now.getMonth() + 1;
        const targetYear = year ?? now.getFullYear();
        const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
        const endOfMonth = new Date(targetYear, targetMonth, 0);
        const dateFilter = {
            userId,
            date: { gte: startOfMonth, lte: endOfMonth },
        };
        const incomeAgg = await this.prisma.transaction.aggregate({
            where: { ...dateFilter, type: 'entrada' },
            _sum: { amount: true },
        });
        const expenseAgg = await this.prisma.transaction.aggregate({
            where: { ...dateFilter, type: 'saida' },
            _sum: { amount: true },
        });
        const totalIncome = Number(incomeAgg._sum.amount ?? 0);
        const totalExpense = Number(expenseAgg._sum.amount ?? 0);
        const byCategory = await this.prisma.transaction.groupBy({
            by: ['categoryId', 'type'],
            where: dateFilter,
            _sum: { amount: true },
        });
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
    async verifyCategoryOwnership(userId, id) {
        const category = await this.prisma.financeCategory.findUnique({
            where: { id },
        });
        if (!category)
            throw new common_1.NotFoundException('Finance category not found');
        if (category.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return category;
    }
    async verifyTransactionOwnership(userId, id) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        if (transaction.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return transaction;
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map