import { FunnelStage } from '@prisma/client';
export declare class UpdateStageDto {
    funnelStage: FunnelStage;
    lostReason?: string;
}
