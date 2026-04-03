import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FunnelStage } from '@prisma/client';

export class UpdateStageDto {
  @ApiProperty({ enum: FunnelStage, example: 'negociando' })
  @IsEnum(FunnelStage)
  funnelStage: FunnelStage;

  @ApiPropertyOptional({ example: 'Preço acima do orçamento' })
  @ValidateIf((o) => o.funnelStage === 'perdido')
  @IsString()
  @IsOptional()
  lostReason?: string;
}
