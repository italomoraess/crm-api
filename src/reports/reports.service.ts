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

  /**
   * Resumo sob medida para o dashboard do layout Converso (autônomo logado).
   * KPIs do mês corrente + série de receita (6 meses) + spark diária (7 dias).
   */
  async getDashboard(userId: string) {
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const leads = await this.prisma.lead.findMany({
      where: { userId, deletedAt: null },
      select: {
        funnelStage: true,
        dealValue: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const isClosed = (s: string) => s === FunnelStage.fechado;
    const isOpen = (s: string) =>
      s !== FunnelStage.fechado && s !== FunnelStage.perdido;
    const val = (d: unknown) => Number(d ?? 0);
    const inRange = (d: Date, a: Date, b: Date) => d >= a && d <= b;

    const receitaMes = leads
      .filter((l) => isClosed(l.funnelStage) && inRange(l.updatedAt, startMonth, endMonth))
      .reduce((s, l) => s + val(l.dealValue), 0);

    const aReceber = leads
      .filter((l) => isOpen(l.funnelStage))
      .reduce((s, l) => s + val(l.dealValue), 0);

    const negociosAbertos = leads.filter((l) => isOpen(l.funnelStage)).length;
    const novosClientes = leads.filter((l) =>
      inRange(l.createdAt, startMonth, endMonth),
    ).length;
    const closedCount = leads.filter((l) => isClosed(l.funnelStage)).length;
    const taxaConversao = leads.length
      ? Math.round((closedCount / leads.length) * 100)
      : 0;

    const [servicosAtivos, agendaHoje] = await Promise.all([
      this.prisma.catalogProduct.count({
        where: { userId, status: 'ativo' },
      }),
      this.prisma.appointment.count({
        where: {
          userId,
          date: {
            gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            lte: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
          },
        },
      }),
    ]);

    // Série de 6 meses (receita fechada por mês, via updatedAt)
    const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const receitaMeses: { m: string; v: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const v = leads
        .filter((l) => isClosed(l.funnelStage) && inRange(l.updatedAt, start, end))
        .reduce((s, l) => s + val(l.dealValue), 0);
      receitaMeses.push({ m: MESES[d.getMonth()], v });
    }

    // Spark dos últimos 7 dias (receita fechada por dia)
    const sparkReceita: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const end = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);
      const v = leads
        .filter((l) => isClosed(l.funnelStage) && inRange(l.updatedAt, start, end))
        .reduce((s, l) => s + val(l.dealValue), 0);
      sparkReceita.push(v);
    }

    // Meta heurística (sem campo dedicado): melhor mês * 1.2, piso 5000.
    const melhorMes = Math.max(...receitaMeses.map((m) => m.v), receitaMes);
    const receitaMeta = Math.max(Math.round((melhorMes * 1.2) / 100) * 100, 5000);

    return {
      kpis: {
        receitaMes,
        receitaMeta,
        receitaDelta: receitaMeses.length >= 2 && receitaMeses[4].v > 0
          ? Math.round(((receitaMes - receitaMeses[4].v) / receitaMeses[4].v) * 100)
          : 0,
        aReceber,
        servicosAtivos,
        negociosAbertos,
        taxaConversao,
        novosClientes,
        agendaHoje,
      },
      receitaMeses,
      sparkReceita,
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
