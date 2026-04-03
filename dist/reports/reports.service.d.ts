import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSummary(userId: string, from?: string, to?: string): Promise<{
        period: {
            from: string;
            to: string;
        };
        total_leads: number;
        total_closed: number;
        conversion_rate: number;
        total_revenue: number;
        leads_by_origin: {
            origin: import("@prisma/client").$Enums.LeadOrigin;
            count: number;
        }[];
        leads_by_week: {
            week: string;
            count: number;
        }[];
        lost_leads: {
            name: string;
            id: string;
            createdAt: Date;
            lostReason: string | null;
        }[];
    }>;
    private getISOWeekKey;
}
