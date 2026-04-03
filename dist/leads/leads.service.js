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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LeadsService = class LeadsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId, query) {
        const where = {
            userId,
            deletedAt: null,
        };
        if (query.stage) {
            where.funnelStage = query.stage;
        }
        if (query.origin) {
            where.origin = query.origin;
        }
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { phone: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.lead.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(userId, id) {
        const lead = await this.prisma.lead.findUnique({
            where: { id },
            include: {
                _count: { select: { appointments: true } },
            },
        });
        if (!lead || lead.deletedAt) {
            throw new common_1.NotFoundException('Lead not found');
        }
        if (lead.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return lead;
    }
    async create(userId, dto) {
        return this.prisma.lead.create({
            data: {
                ...dto,
                userId,
            },
        });
    }
    async update(userId, id, dto) {
        await this.verifyOwnership(userId, id);
        return this.prisma.lead.update({
            where: { id },
            data: dto,
        });
    }
    async updateStage(userId, id, dto) {
        await this.verifyOwnership(userId, id);
        return this.prisma.lead.update({
            where: { id },
            data: {
                funnelStage: dto.funnelStage,
                lostReason: dto.funnelStage === 'perdido' ? dto.lostReason : null,
            },
        });
    }
    async remove(userId, id) {
        await this.verifyOwnership(userId, id);
        return this.prisma.lead.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
    async verifyOwnership(userId, id) {
        const lead = await this.prisma.lead.findUnique({ where: { id } });
        if (!lead || lead.deletedAt) {
            throw new common_1.NotFoundException('Lead not found');
        }
        if (lead.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return lead;
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map