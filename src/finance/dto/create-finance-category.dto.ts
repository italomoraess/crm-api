import { IsString, IsEnum, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class CreateFinanceCategoryDto {
  @ApiProperty({ example: 'Vendas' })
  @IsString()
  name: string;

  @ApiProperty({ enum: TransactionType, example: 'entrada' })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({ example: '#22C55E', description: 'Hex color for UI grouping' })
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a valid hex color (e.g. #22C55E)',
  })
  color?: string;
}
