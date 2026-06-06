import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyRole, FunnelStage, MemberStatus } from '@prisma/client';

const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

/** Stats de um autônomo, no formato que o painel Empresa (Membro) consome. */
export interface MemberStats {
  id: string; // membership id
  userId: string | null;
  nome: string;
  email: string | null;
  area: string | null;
  role: CompanyRole;
  status: MemberStatus;
  receita: number;
  clientes: number;
  negocios: number;
  conversao: number;
  servicos: number;
  desde: string;
  spark: number[];
}

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  // ─── Empresa ────────────────────────────────────────────────────────

  async getCompany(userId: string) {
    const { companyId } = await this.assertAdmin(userId);
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new NotFoundException('Company not found');

    const owner = await this.prisma.membership.findFirst({
      where: { companyId, role: CompanyRole.owner },
      include: { user: { select: { name: true, email: true } } },
    });

    return {
      id: company.id,
      name: company.name,
      plan: company.plan,
      monthlyGoal: company.monthlyGoal ? Number(company.monthlyGoal) : null,
      admin: owner?.user?.name ?? owner?.invitedName ?? null,
    };
  }

  async updateCompany(userId: string, dto: UpdateCompanyDto) {
    const { companyId } = await this.assertAdmin(userId);
    const company = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        name: dto.name,
        plan: dto.plan,
        monthlyGoal: dto.monthlyGoal,
      },
    });
    return {
      id: company.id,
      name: company.name,
      plan: company.plan,
      monthlyGoal: company.monthlyGoal ? Number(company.monthlyGoal) : null,
    };
  }

  // ─── Membros (autônomos) ────────────────────────────────────────────

  async listMembers(userId: string): Promise<MemberStats[]> {
    const { companyId } = await this.assertAdmin(userId);
    const memberships = await this.prisma.membership.findMany({
      where: { companyId },
      include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const window = this.monthWindow();
    return Promise.all(memberships.map((m) => this.toMemberStats(m, window)));
  }

  async invite(userId: string, dto: InviteMemberDto) {
    const { companyId } = await this.assertAdmin(userId);

    // Se o e-mail já tem conta, vincula direto (userId preenchido).
    let linkedUserId: string | null = null;
    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
        select: { id: true },
      });
      linkedUserId = existing?.id ?? null;

      if (linkedUserId) {
        const dup = await this.prisma.membership.findUnique({
          where: { companyId_userId: { companyId, userId: linkedUserId } },
        });
        if (dup) throw new ConflictException('Usuário já faz parte da empresa');
      }
    }

    const membership = await this.prisma.membership.create({
      data: {
        companyId,
        userId: linkedUserId,
        invitedName: dto.name,
        invitedEmail: dto.email,
        area: dto.area,
        role: dto.role ?? CompanyRole.member,
        status: MemberStatus.pendente,
      },
    });
    return this.toMemberStats(
      { ...membership, user: null },
      this.monthWindow(),
    );
  }

  async updateMember(userId: string, membershipId: string, dto: UpdateMemberDto) {
    const { companyId } = await this.assertAdmin(userId);
    await this.assertMemberInCompany(membershipId, companyId);

    const membership = await this.prisma.membership.update({
      where: { id: membershipId },
      data: {
        status: dto.status,
        area: dto.area,
        role: dto.role,
        // ao ativar pela primeira vez, registra a data de entrada
        joinedAt: dto.status === MemberStatus.ativo ? new Date() : undefined,
      },
      include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
    });
    return this.toMemberStats(membership, this.monthWindow());
  }

  async removeMember(userId: string, membershipId: string) {
    const { companyId } = await this.assertAdmin(userId);
    const membership = await this.assertMemberInCompany(membershipId, companyId);
    if (membership.role === CompanyRole.owner) {
      throw new ForbiddenException('Não é possível remover o dono da empresa');
    }
    await this.prisma.membership.delete({ where: { id: membershipId } });
    return { id: membershipId };
  }

  // ─── Resumo / desempenho da equipe ──────────────────────────────────

  async getSummary(userId: string) {
    const { companyId } = await this.assertAdmin(userId);
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    const members = await this.listMembers(userId);

    const ativos = members.filter((m) => m.status === MemberStatus.ativo);
    const faturamento = members.reduce((s, m) => s + m.receita, 0);
    const clientes = members.reduce((s, m) => s + m.clientes, 0);
    const negocios = members.reduce((s, m) => s + m.negocios, 0);
    const ticket = clientes ? Math.round(faturamento / clientes) : 0;
    const meta = company?.monthlyGoal ? Number(company.monthlyGoal) : 0;

    const window = this.monthWindow();
    const meses = window.map((w, i) => ({
      m: w.label,
      v: members.reduce((s, m) => s + (m.spark[i] || 0), 0),
    }));

    const porAreaMap = new Map<string, number>();
    for (const m of members) {
      const area = m.area ?? 'Outros';
      porAreaMap.set(area, (porAreaMap.get(area) ?? 0) + m.receita);
    }
    const porArea = Array.from(porAreaMap.entries())
      .map(([area, receita]) => ({ area, receita }))
      .sort((a, b) => b.receita - a.receita);

    return {
      company: {
        id: companyId,
        name: company?.name ?? null,
        plan: company?.plan ?? null,
        monthlyGoal: meta || null,
      },
      faturamento,
      clientes,
      negocios,
      ticket,
      ativos: ativos.length,
      total: members.length,
      pctMeta: meta ? Math.round((faturamento / meta) * 100) : 0,
      meses,
      porArea,
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────

  /** Garante que o usuário é owner/admin de alguma empresa e retorna o companyId. */
  private async assertAdmin(userId: string): Promise<{ companyId: string }> {
    const membership = await this.prisma.membership.findFirst({
      where: {
        userId,
        role: { in: [CompanyRole.owner, CompanyRole.admin] },
      },
    });
    if (!membership) {
      throw new ForbiddenException('Acesso restrito a administradores de empresa');
    }
    return { companyId: membership.companyId };
  }

  private async assertMemberInCompany(membershipId: string, companyId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { id: membershipId },
    });
    if (!membership || membership.companyId !== companyId) {
      throw new NotFoundException('Membro não encontrado');
    }
    return membership;
  }

  /** Janela de 6 meses terminando no mês atual (mais antigo primeiro). */
  private monthWindow() {
    const now = new Date();
    const window: { year: number; month: number; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      window.push({ year: d.getFullYear(), month: d.getMonth(), label: MESES[d.getMonth()] });
    }
    return window;
  }

  private async toMemberStats(
    membership: {
      id: string;
      userId: string | null;
      invitedName: string | null;
      invitedEmail: string | null;
      area: string | null;
      role: CompanyRole;
      status: MemberStatus;
      createdAt: Date;
      user: { id: string; name: string | null; email: string; createdAt: Date } | null;
    },
    window: { year: number; month: number; label: string }[],
  ): Promise<MemberStats> {
    const base: MemberStats = {
      id: membership.id,
      userId: membership.userId,
      nome: membership.user?.name ?? membership.invitedName ?? 'Convidado',
      email: membership.user?.email ?? membership.invitedEmail ?? null,
      area: membership.area,
      role: membership.role,
      status: membership.status,
      receita: 0,
      clientes: 0,
      negocios: 0,
      conversao: 0,
      servicos: 0,
      desde: String((membership.user?.createdAt ?? membership.createdAt).getFullYear()),
      spark: window.map(() => 0),
    };

    // Convite ainda sem conta → stats zeradas.
    if (!membership.userId) return base;

    const uid = membership.userId;
    const [leads, servicos] = await Promise.all([
      this.prisma.lead.findMany({
        where: { userId: uid, deletedAt: null },
        select: { funnelStage: true, dealValue: true, createdAt: true },
      }),
      this.prisma.catalogProduct.count({ where: { userId: uid } }),
    ]);

    const closed = leads.filter((l) => l.funnelStage === FunnelStage.fechado);
    const open = leads.filter(
      (l) =>
        l.funnelStage !== FunnelStage.fechado &&
        l.funnelStage !== FunnelStage.perdido,
    );

    const spark = window.map((w) =>
      closed
        .filter(
          (l) =>
            l.createdAt.getFullYear() === w.year &&
            l.createdAt.getMonth() === w.month,
        )
        .reduce((s, l) => s + Number(l.dealValue ?? 0), 0),
    );

    base.clientes = leads.length;
    base.negocios = open.length;
    base.conversao = leads.length
      ? Math.round((closed.length / leads.length) * 100)
      : 0;
    base.servicos = servicos;
    base.spark = spark;
    base.receita = spark[spark.length - 1] ?? 0; // mês atual
    return base;
  }
}
