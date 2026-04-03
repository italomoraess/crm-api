import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  Matches,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentType } from '@prisma/client';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'Reunião com cliente' })
  @IsString()
  title: string;

  @ApiProperty({ example: '2026-04-15', description: 'YYYY-MM-DD format' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ enum: AppointmentType, example: 'reuniao' })
  @IsOptional()
  @IsEnum(AppointmentType)
  type?: AppointmentType;

  @ApiPropertyOptional({ example: '09:00', description: 'HH:mm format' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be in HH:mm format',
  })
  startTime?: string;

  @ApiPropertyOptional({ example: '10:00', description: 'HH:mm format' })
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be in HH:mm format',
  })
  endTime?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  allDay?: boolean;

  @ApiPropertyOptional({ description: 'Lead ID to associate' })
  @IsOptional()
  @IsUUID()
  leadId?: string;

  @ApiPropertyOptional({ example: 'Discutir proposta comercial' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '#4F46E5', description: 'Hex color for calendar UI' })
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a valid hex color (e.g. #4F46E5)',
  })
  color?: string;
}
