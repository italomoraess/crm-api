import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FunnelStage } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string, from?: string, to?: string) {
    // Default to current month if no range provided
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

    // Total leads in range
    const totalLeads = await this.prisma.lead.count({
      where: dateFilter,
    });

    // Total closed
    const totalClosed = await this.prisma.lead.count({
      where: { ...dateFilter, funnelStage: FunnelStage.fechado },
    });

    // Conversion rate
    const conversionRate =
      totalLeads > 0
        ? parseFloat(((totalClosed / totalLeads) * 100).toFixed(2))
        : 0;

    // Total revenue (dealValue sum for fechado leads)
    const revenueAgg = await this.prisma.lead.aggregate({
      where: { ...dateFilter, funnelStage: FunnelStage.fechado },
      _sum: { dealValue: true },
    });
    const totalRevenue = Number(revenueAgg._sum.dealValue ?? 0);

    // Leads by origin
    const leadsByOrigin = await this.prisma.lead.groupBy({
      by: ['origin'],
      where: dateFilter,
      _count: { id: true },
    });

    const leadsByOriginResult = leadsByOrigin.map((g) => ({
      origin: g.origin,
      count: g._count.id,
    }));

    // Leads by week (last 4 weeks from endDate)
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

    // Group by ISO week manually
    const weekMap = new Map<string, number>();
    for (const lead of recentLeads) {
      const weekKey = this.getISOWeekKey(lead.createdAt);
      weekMap.set(weekKey, (weekMap.get(weekKey) ?? 0) + 1);
    }

    const leadsByWeek = Array.from(weekMap.entries())
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // Lost leads
    const lostLeads = await this.prisma.lead.findMany({
      where: { ...dateFilter, funnelStage: FunnelStage.perdido },
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

  private getISOWeekKey(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    const weekNum =
      1 +
      Math.round(
        ((d.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7,
      );
    return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
  }
}
