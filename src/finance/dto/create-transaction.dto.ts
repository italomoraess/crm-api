import { IsUUID, IsEnum, IsNumber, IsDateString, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Finance category ID' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ enum: TransactionType, example: 'entrada' })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: 1500.50 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: '2026-04-01', description: 'Transaction date (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: 'Pagamento do cliente X' })
  @IsOptional()
  @IsString()
  description?: string;
}
