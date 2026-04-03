import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FunnelStage, LeadOrigin } from '@prisma/client';

export class QueryLeadsDto {
  @ApiPropertyOptional({ enum: FunnelStage })
  @IsOptional()
  @IsEnum(FunnelStage)
  stage?: FunnelStage;

  @ApiPropertyOptional({ description: 'Search by name or phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: LeadOrigin })
  @IsOptional()
  @IsEnum(LeadOrigin)
  origin?: LeadOrigin;
}
