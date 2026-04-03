import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    findAll(user: {
        userId: string;
    }, query: QueryLeadsDto): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        cpfCnpj: string | null;
        origin: import("@prisma/client").$Enums.LeadOrigin;
        location: string | null;
        observations: string | null;
        recurringSale: boolean;
        funnelStage: import("@prisma/client").$Enums.FunnelStage;
        dealValue: import("@prisma/client/runtime/library").Decimal | null;
        lostReason: string | null;
        deletedAt: Date | null;
    }[]>;
    findOne(user: {
        userId: string;
    }, id: string): Promise<{
        _count: {
            appointments: number;
        };
    } & {
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        cpfCnpj: string | null;
        origin: import("@prisma/client").$Enums.LeadOrigin;
        location: string | null;
        observations: string | null;
        recurringSale: boolean;
        funnelStage: import("@prisma/client").$Enums.FunnelStage;
        dealValue: import("@prisma/client/runtime/library").Decimal | null;
        lostReason: string | null;
        deletedAt: Date | null;
    }>;
    create(user: {
        userId: string;
    }, dto: CreateLeadDto): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        cpfCnpj: string | null;
        origin: import("@prisma/client").$Enums.LeadOrigin;
        location: string | null;
        observations: string | null;
        recurringSale: boolean;
        funnelStage: import("@prisma/client").$Enums.FunnelStage;
        dealValue: import("@prisma/client/runtime/library").Decimal | null;
        lostReason: string | null;
        deletedAt: Date | null;
    }>;
    update(user: {
        userId: string;
    }, id: string, dto: UpdateLeadDto): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        cpfCnpj: string | null;
        origin: import("@prisma/client").$Enums.LeadOrigin;
        location: string | null;
        observations: string | null;
        recurringSale: boolean;
        funnelStage: import("@prisma/client").$Enums.FunnelStage;
        dealValue: import("@prisma/client/runtime/library").Decimal | null;
        lostReason: string | null;
        deletedAt: Date | null;
    }>;
    updateStage(user: {
        userId: string;
    }, id: string, dto: UpdateStageDto): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        cpfCnpj: string | null;
        origin: import("@prisma/client").$Enums.LeadOrigin;
        location: string | null;
        observations: string | null;
        recurringSale: boolean;
        funnelStage: import("@prisma/client").$Enums.FunnelStage;
        dealValue: import("@prisma/client/runtime/library").Decimal | null;
        lostReason: string | null;
        deletedAt: Date | null;
    }>;
    remove(user: {
        userId: string;
    }, id: string): Promise<{
        email: string | null;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        phone: string;
        cpfCnpj: string | null;
        origin: import("@prisma/client").$Enums.LeadOrigin;
        location: string | null;
        observations: string | null;
        recurringSale: boolean;
        funnelStage: import("@prisma/client").$Enums.FunnelStage;
        dealValue: import("@prisma/client/runtime/library").Decimal | null;
        lostReason: string | null;
        deletedAt: Date | null;
    }>;
}
