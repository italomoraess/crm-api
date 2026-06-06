import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyRole, MemberStatus } from '@prisma/client';

export class UpdateMemberDto {
  @ApiPropertyOptional({ enum: MemberStatus, description: 'ativo (aprovar) / pendente / inativo' })
  @IsOptional()
  @IsEnum(MemberStatus)
  status?: MemberStatus;

  @ApiPropertyOptional({ example: 'Fotografia' })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional({ enum: CompanyRole })
  @IsOptional()
  @IsEnum(CompanyRole)
  role?: CompanyRole;
}
