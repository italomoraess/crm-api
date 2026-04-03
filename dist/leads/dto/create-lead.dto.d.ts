import { LeadOrigin, FunnelStage } from '@prisma/client';
export declare class CreateLeadDto {
    name: string;
    phone: string;
    cpfCnpj?: string;
    email?: string;
    origin?: LeadOrigin;
    location?: string;
    observations?: string;
    recurringSale?: boolean;
    funnelStage?: FunnelStage;
    dealValue?: number;
}
