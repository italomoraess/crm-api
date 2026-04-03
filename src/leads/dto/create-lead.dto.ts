import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadOrigin, FunnelStage } from '@prisma/client';

export class CreateLeadDto {
  @ApiProperty({ example: 'Maria Souza' })
  @IsString()
  name: string;

  @ApiProperty({ example: '11999998888' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: '12345678901' })
  @IsOptional()
  @IsString()
  cpfCnpj?: string;

  @ApiPropertyOptional({ example: 'maria@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: LeadOrigin, example: 'instagram' })
  @IsOptional()
  @IsEnum(LeadOrigin)
  origin?: LeadOrigin;

  @ApiPropertyOptional({ example: 'São Paulo, SP' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 'Cliente indicado pelo João' })
  @IsOptional()
  @IsString()
  observations?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  recurringSale?: boolean;

  @ApiPropertyOptional({ enum: FunnelStage, example: 'novo' })
  @IsOptional()
  @IsEnum(FunnelStage)
  funnelStage?: FunnelStage;

  @ApiPropertyOptional({ example: 1500.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dealValue?: number;
}
