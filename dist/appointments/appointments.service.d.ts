import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
export declare class AppointmentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string, query: QueryAppointmentsDto): Promise<({
        lead: {
            name: string;
            id: string;
            phone: string;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.AppointmentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        allDay: boolean;
        leadId: string | null;
        color: string | null;
        completed: boolean;
    })[]>;
    findByDate(userId: string, dateStr: string): Promise<({
        lead: {
            name: string;
            id: string;
            phone: string;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.AppointmentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        allDay: boolean;
        leadId: string | null;
        color: string | null;
        completed: boolean;
    })[]>;
    findUpcoming(userId: string): Promise<({
        lead: {
            name: string;
            id: string;
            phone: string;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.AppointmentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        allDay: boolean;
        leadId: string | null;
        color: string | null;
        completed: boolean;
    })[]>;
    create(userId: string, dto: CreateAppointmentDto): Promise<{
        lead: {
            name: string;
            id: string;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.AppointmentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        allDay: boolean;
        leadId: string | null;
        color: string | null;
        completed: boolean;
    }>;
    update(userId: string, id: string, dto: UpdateAppointmentDto): Promise<{
        lead: {
            name: string;
            id: string;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.AppointmentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        allDay: boolean;
        leadId: string | null;
        color: string | null;
        completed: boolean;
    }>;
    complete(userId: string, id: string): Promise<{
        type: import("@prisma/client").$Enums.AppointmentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        allDay: boolean;
        leadId: string | null;
        color: string | null;
        completed: boolean;
    }>;
    remove(userId: string, id: string): Promise<{
        type: import("@prisma/client").$Enums.AppointmentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        date: Date;
        startTime: string | null;
        endTime: string | null;
        allDay: boolean;
        leadId: string | null;
        color: string | null;
        completed: boolean;
    }>;
    private verifyOwnership;
}
