import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List appointments (filter by month/year or date range)' })
  findAll(
    @CurrentUser() user: { userId: string },
    @Query() query: QueryAppointmentsDto,
  ) {
    return this.appointmentsService.findAll(user.userId, query);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming appointments (next 7 days, not completed)' })
  findUpcoming(@CurrentUser() user: { userId: string }) {
    return this.appointmentsService.findUpcoming(user.userId);
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Get all appointments for a specific date (YYYY-MM-DD)' })
  findByDate(
    @CurrentUser() user: { userId: string },
    @Param('date') date: string,
  ) {
    return this.appointmentsService.findByDate(user.userId, date);
  }

  @Post()
  @ApiOperation({ summary: 'Create an appointment' })
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an appointment' })
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(user.userId, id, dto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark appointment as completed' })
  complete(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.appointmentsService.complete(user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an appointment' })
  remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.appointmentsService.remove(user.userId, id);
  }
}
