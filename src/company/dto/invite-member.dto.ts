import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyRole } from '@prisma/client';

export class InviteMemberDto {
  @ApiProperty({ example: 'Fernanda Lima' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'fernanda@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Educação', description: 'Área de atuação' })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiPropertyOptional({ enum: CompanyRole, example: 'member' })
  @IsOptional()
  @IsEnum(CompanyRole)
  role?: CompanyRole;
}
