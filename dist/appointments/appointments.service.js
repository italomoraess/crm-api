"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AppointmentsService = class AppointmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId, query) {
        const where = { userId };
        if (query.month && query.year) {
            const startOfMonth = new Date(query.year, query.month - 1, 1);
            const endOfMonth = new Date(query.year, query.month, 0);
            where.date = { gte: startOfMonth, lte: endOfMonth };
        }
        else if (query.from || query.to) {
            where.date = {};
            if (query.from)
                where.date.gte = new Date(query.from);
            if (query.to)
                where.date.lte = new Date(query.to);
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
    async findByDate(userId, dateStr) {
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
    async findUpcoming(userId) {
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
    async create(userId, dto) {
        if (dto.startTime && dto.endTime && dto.endTime <= dto.startTime) {
            throw new common_1.BadRequestException('endTime must be after startTime');
        }
        const data = {
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
    async update(userId, id, dto) {
        await this.verifyOwnership(userId, id);
        if (dto.startTime && dto.endTime && dto.endTime <= dto.startTime) {
            throw new common_1.BadRequestException('endTime must be after startTime');
        }
        const data = { ...dto };
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
    async complete(userId, id) {
        await this.verifyOwnership(userId, id);
        return this.prisma.appointment.update({
            where: { id },
            data: { completed: true },
        });
    }
    async remove(userId, id) {
        await this.verifyOwnership(userId, id);
        return this.prisma.appointment.delete({ where: { id } });
    }
    async verifyOwnership(userId, id) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.userId !== userId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return appointment;
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map