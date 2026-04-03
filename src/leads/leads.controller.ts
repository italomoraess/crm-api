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
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { QueryLeadsDto } from './dto/query-leads.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Leads')
@ApiBearerAuth()
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List all leads with optional filters' })
  findAll(
    @CurrentUser() user: { userId: string },
    @Query() query: QueryLeadsDto,
  ) {
    return this.leadsService.findAll(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead by ID' })
  findOne(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.leadsService.findOne(user.userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new lead' })
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateLeadDto,
  ) {
    return this.leadsService.create(user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead' })
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadsService.update(user.userId, id, dto);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Update lead funnel stage' })
  updateStage(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateStageDto,
  ) {
    return this.leadsService.updateStage(user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a lead' })
  remove(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.leadsService.remove(user.userId, id);
  }
}
