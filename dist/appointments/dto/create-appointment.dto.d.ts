import { AppointmentType } from '@prisma/client';
export declare class CreateAppointmentDto {
    title: string;
    date: string;
    type?: AppointmentType;
    startTime?: string;
    endTime?: string;
    allDay?: boolean;
    leadId?: string;
    description?: string;
    color?: string;
}
