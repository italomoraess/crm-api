import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, query: QueryLeadsDto) {
    const where: Prisma.LeadWhereInput = {
      userId,
      deletedAt: null,
    };

    if (query.stage) {
      where.funnelStage = query.stage;
    }

    if (query.origin) {
      where.origin = query.origin;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        _count: { select: { appointments: true } },
      },
    });

    if (!lead || lead.deletedAt) {
      throw new NotFoundException('Lead not found');
    }

    if (lead.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return lead;
  }

  async create(userId: string, dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateLeadDto) {
    await this.verifyOwnership(userId, id);

    return this.prisma.lead.update({
      where: { id },
      data: dto,
    });
  }

  async updateStage(userId: string, id: string, dto: UpdateStageDto) {
    await this.verifyOwnership(userId, id);

    return this.prisma.lead.update({
      where: { id },
      data: {
        funnelStage: dto.funnelStage,
        lostReason: dto.funnelStage === 'perdido' ? dto.lostReason : null,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.verifyOwnership(userId, id);

    return this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async verifyOwnership(userId: string, id: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });

    if (!lead || lead.deletedAt) {
      throw new NotFoundException('Lead not found');
    }

    if (lead.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return lead;
  }
}
