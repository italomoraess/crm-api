import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const STRIPE_ACTIVE = new Set(['active', 'trialing']);

export type UserSubscriptionProfile = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  trialEndsAt: Date;
  stripeSubscriptionStatus: string | null;
  hasAccess: boolean;
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
      },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      trialEndsAt: user.trialEndsAt,
      stripeSubscriptionStatus: user.stripeSubscriptionStatus,
      hasAccess: this.computeHasAccess(user),
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
