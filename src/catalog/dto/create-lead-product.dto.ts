import { IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeadProductDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: '2026-04-01', description: 'Start date (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;
}
