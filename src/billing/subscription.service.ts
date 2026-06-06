import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const STRIPE_ACTIVE = new Set(['active', 'trialing']);

export type UserCompanyProfile = {
  id: string;
  name: string;
  role: string;
};

export type UserSubscriptionProfile = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  trialEndsAt: Date;
  stripeSubscriptionStatus: string | null;
  hasAccess: boolean;
  subscriptionCancelAtPeriodEnd: boolean;
  subscriptionPeriodEnd: Date | null;
  /** 'admin' se o usuário é owner/admin de uma empresa; senão 'autonomo'. */
  role: 'admin' | 'autonomo';
  /** Empresa em que é owner/admin (painel Empresa), ou null. */
  company: UserCompanyProfile | null;
};

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  computeHasAccess(row: {
    trialEndsAt: Date;
    stripeSubscriptionStatus: string | null;
  }): boolean {
    if (row.trialEndsAt > new Date()) {
      return true;
    }
    const st = row.stripeSubscriptionStatus;
    return !!st && STRIPE_ACTIVE.has(st);
  }

  async getProfilePayload(userId: string): Promise<UserSubscriptionProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        trialEndsAt: true,
        stripeSubscriptionStatus: true,
        subscriptionCancelAtPeriodEnd: true,
        subscriptionPeriodEnd: true,
      },
    });
    if (!user) return null;

    const adminMembership = await this.prisma.membership.findFirst({
      where: { userId, role: { in: ['owner', 'admin'] } },
      include: { company: { select: { id: true, name: true } } },
    });
    const company: UserCompanyProfile | null = adminMembership
      ? {
          id: adminMembership.company.id,
          name: adminMembership.company.name,
          role: adminMembership.role,
        }
      : null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      trialEndsAt: user.trialEndsAt,
      stripeSubscriptionStatus: user.stripeSubscriptionStatus,
      hasAccess: this.computeHasAccess(user),
      subscriptionCancelAtPeriodEnd: user.subscriptionCancelAtPeriodEnd,
      subscriptionPeriodEnd: user.subscriptionPeriodEnd,
      role: company ? 'admin' : 'autonomo',
      company,
    };
  }

  async assertUserHasAccess(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { trialEndsAt: true, stripeSubscriptionStatus: true },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!this.computeHasAccess(user)) {
      throw new HttpException(
        'Período de teste encerrado. Assine para continuar usando o app.',
        HttpStatus.PAYMENT_REQUIRED,
      );
    }
  }
}
