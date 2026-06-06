import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Company')
@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOperation({ summary: 'Dados da empresa do admin atual' })
  getCompany(@CurrentUser() user: { userId: string }) {
    return this.companyService.getCompany(user.userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Atualizar nome/plano/meta da empresa' })
  updateCompany(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companyService.updateCompany(user.userId, dto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumo agregado da equipe (faturamento, meta, por área, meses)' })
  getSummary(@CurrentUser() user: { userId: string }) {
    return this.companyService.getSummary(user.userId);
  }

  @Get('members')
  @ApiOperation({ summary: 'Lista de autônomos com stats agregadas' })
  listMembers(@CurrentUser() user: { userId: string }) {
    return this.companyService.listMembers(user.userId);
  }

  @Post('members')
  @ApiOperation({ summary: 'Convidar autônomo (cadastro pendente até aprovação)' })
  invite(
    @CurrentUser() user: { userId: string },
    @Body() dto: InviteMemberDto,
  ) {
    return this.companyService.invite(user.userId, dto);
  }

  @Patch('members/:id')
  @ApiOperation({ summary: 'Atualizar status/área/papel do autônomo (aprovar = status ativo)' })
  updateMember(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.companyService.updateMember(user.userId, id, dto);
  }

  @Delete('members/:id')
  @ApiOperation({ summary: 'Remover autônomo da empresa' })
  removeMember(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
  ) {
    return this.companyService.removeMember(user.userId, id);
  }
}
