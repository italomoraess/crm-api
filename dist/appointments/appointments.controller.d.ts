import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    findAll(user: {
        userId: string;
    }, query: QueryAppointmentsDto): Promise<({
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
    findUpcoming(user: {
        userId: string;
    }): Promise<({
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
    findByDate(user: {
        userId: string;
    }, date: string): Promise<({
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
    create(user: {
        userId: string;
    }, dto: CreateAppointmentDto): Promise<{
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
    update(user: {
        userId: string;
    }, id: string, dto: UpdateAppointmentDto): Promise<{
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
    complete(user: {
        userId: string;
    }, id: string): Promise<{
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
    remove(user: {
        userId: string;
    }, id: string): Promise<{
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
}
