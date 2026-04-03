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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary(userId, from, to) {
        const now = new Date();
        const startDate = from
            ? new Date(from)
            : new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = to
            ? new Date(to)
            : new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const dateFilter = {
            userId,
            deletedAt: null,
            createdAt: { gte: startDate, lte: endDate },
        };
        const totalLeads = await this.prisma.lead.count({
            where: dateFilter,
        });
        const totalClosed = await this.prisma.lead.count({
            where: { ...dateFilter, funnelStage: client_1.FunnelStage.fechado },
        });
        const conversionRate = totalLeads > 0
            ? parseFloat(((totalClosed / totalLeads) * 100).toFixed(2))
            : 0;
        const revenueAgg = await this.prisma.lead.aggregate({
            where: { ...dateFilter, funnelStage: client_1.FunnelStage.fechado },
            _sum: { dealValue: true },
        });
        const totalRevenue = Number(revenueAgg._sum.dealValue ?? 0);
        const leadsByOrigin = await this.prisma.lead.groupBy({
            by: ['origin'],
            where: dateFilter,
            _count: { id: true },
        });
        const leadsByOriginResult = leadsByOrigin.map((g) => ({
            origin: g.origin,
            count: g._count.id,
        }));
        const fourWeeksAgo = new Date(endDate);
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        const recentLeads = await this.prisma.lead.findMany({
            where: {
                userId,
                deletedAt: null,
                createdAt: { gte: fourWeeksAgo, lte: endDate },
            },
            select: { createdAt: true },
        });
        const weekMap = new Map();
        for (const lead of recentLeads) {
            const weekKey = this.getISOWeekKey(lead.createdAt);
            weekMap.set(weekKey, (weekMap.get(weekKey) ?? 0) + 1);
        }
        const leadsByWeek = Array.from(weekMap.entries())
            .map(([week, count]) => ({ week, count }))
            .sort((a, b) => a.week.localeCompare(b.week));
        const lostLeads = await this.prisma.lead.findMany({
            where: { ...dateFilter, funnelStage: client_1.FunnelStage.perdido },
            select: { id: true, name: true, lostReason: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });
        return {
            period: { from: startDate.toISOString(), to: endDate.toISOString() },
            total_leads: totalLeads,
            total_closed: totalClosed,
            conversion_rate: conversionRate,
            total_revenue: totalRevenue,
            leads_by_origin: leadsByOriginResult,
            leads_by_week: leadsByWeek,
            lost_leads: lostLeads,
        };
    }
    getISOWeekKey(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
        const week1 = new Date(d.getFullYear(), 0, 4);
        const weekNum = 1 +
            Math.round(((d.getTime() - week1.getTime()) / 86400000 -
                3 +
                ((week1.getDay() + 6) % 7)) /
                7);
        return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map