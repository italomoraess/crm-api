import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  IsUUID,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceStatus } from '@prisma/client';

export class CreateProductDto {
  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'Corte de Cabelo' })
  @IsString()
  name: string;

  @ApiProperty({ example: 50.0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 30, description: 'Duration in days for expiring products' })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @ApiPropertyOptional({
    example: '1h30',
    description: 'Free-text duration shown in the UI (e.g. "1h", "1h30", "3h")',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ example: 'Visita técnica, diagnóstico e troca de pontos.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ServiceStatus, example: 'ativo' })
  @IsOptional()
  @IsEnum(ServiceStatus)
  status?: ServiceStatus;
}
