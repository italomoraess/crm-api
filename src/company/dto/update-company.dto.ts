import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyPlan } from '@prisma/client';

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'Studio Coletivo' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: CompanyPlan, example: 'empresa' })
  @IsOptional()
  @IsEnum(CompanyPlan)
  plan?: CompanyPlan;

  @ApiPropertyOptional({ example: 45000, description: 'Meta de faturamento mensal da equipe' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyGoal?: number;
}
