import { IsString, IsNumber, IsOptional, IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
}
