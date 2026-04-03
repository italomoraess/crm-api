import { FunnelStage, LeadOrigin } from '@prisma/client';
export declare class QueryLeadsDto {
    stage?: FunnelStage;
    search?: string;
    origin?: LeadOrigin;
}
