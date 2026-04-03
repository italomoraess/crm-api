import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: QueryAppointmentsDto) {
    const where: Prisma.AppointmentWhereInput = { userId };

    // Month/year filtering for calendar view
    if (query.month && query.year) {
      const startOfMonth = new Date(query.year, query.month - 1, 1);
      const endOfMonth = new Date(query.year, query.month, 0);
      where.date = { gte: startOfMonth, lte: endOfMonth };
    } else if (query.from || query.to) {
      where.date = {};
      if (query.from) where.date.gte = new Date(query.from);
      if (query.to) where.date.lte = new Date(query.to);
    }

    if (query.leadId) {
      where.leadId = query.leadId;
    }

    if (query.completed !== undefined) {
      where.completed = query.completed;
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        lead: { select: { id: true, name: true, phone: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findByDate(userId: string, dateStr: string) {
    const date = new Date(dateStr);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.prisma.appointment.findMany({
      where: {
        userId,
        date: { gte: date, lt: nextDay },
      },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findUpcoming(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return this.prisma.appointment.findMany({
      where: {
        userId,
        date: { gte: today, lte: nextWeek },
        completed: false,
      },
      include: {
        lead: { select: { id: true, name: true, phone: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async create(userId: string, dto: CreateAppointmentDto) {
    // Validate time range
    if (dto.startTime && dto.endTime && dto.endTime <= dto.startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const data: Prisma.AppointmentCreateInput = {
      user: { connect: { id: userId } },
      title: dto.title,
      date: new Date(dto.date),
      type: dto.type,
      description: dto.description,
      color: dto.color,
      allDay: dto.allDay ?? false,
      startTime: dto.allDay ? null : dto.startTime,
      endTime: dto.allDay ? null : dto.endTime,
      completed: false,
    };

    if (dto.leadId) {
      data.lead = { connect: { id: dto.leadId } };
    }

    return this.prisma.appointment.create({
      data,
      include: {
        lead: { select: { id: true, name: true } },
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateAppointmentDto) {
    await this.verifyOwnership(userId, id);

    if (dto.startTime && dto.endTime && dto.endTime <= dto.startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const data: Prisma.AppointmentUpdateInput = { ...dto };

    if (dto.date) {
      data.date = new Date(dto.date);
    }

    if (dto.allDay) {
      data.startTime = null;
      data.endTime = null;
    }

    if (dto.leadId) {
      data.lead = { connect: { id: dto.leadId } };
    }

    return this.prisma.appointment.update({
      where: { id },
      data,
      include: {
        lead: { select: { id: true, name: true } },
      },
    });
  }

  async complete(userId: string, id: string) {
    await this.verifyOwnership(userId, id);

    return this.prisma.appointment.update({
      where: { id },
      data: { completed: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.verifyOwnership(userId, id);

    return this.prisma.appointment.delete({ where: { id } });
  }

  private async verifyOwnership(userId: string, id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return appointment;
  }
}
