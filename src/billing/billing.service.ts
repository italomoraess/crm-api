import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plan } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

type StripeClient = InstanceType<typeof Stripe>;

type StripeSubscriptionLike = {
  id: string;
  status: string;
  cancel_at_period_end?: boolean | null;
  current_period_end?: number;
  metadata?: Record<string, string> | null;
};

@Injectable()
export class BillingService {
  private readonly stripe: StripeClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const key = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(key ?? '', {
      apiVersion: '2026-03-25.dahlia',
    });
  }

  async createCheckoutSession(userId: string): Promise<{ url: string }> {
    const priceId = this.configService.get<string>('STRIPE_PRICE_ID');
    if (!priceId) {
      throw new BadRequestException('STRIPE_PRICE_ID não configurado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
      },
    });
    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await this.prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const successUrl =
      this.configService.get<string>('STRIPE_SUCCESS_URL') ??
      'converso://billing/success?session_id={CHECKOUT_SESSION_ID}';
    const cancelUrl =
      this.configService.get<string>('STRIPE_CANCEL_URL') ??
      'converso://billing/cancel';

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      metadata: { userId: user.id },
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        metadata: { userId: user.id },
      },
      success_url: successUrl.includes('{CHECKOUT_SESSION_ID}')
        ? successUrl
        : `${successUrl}${successUrl.includes('?') ? '&' : '?'}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      throw new BadRequestException(
        'Não foi possível criar a sessão de pagamento',
      );
    }

    return { url: session.url };
  }

  private stripeSubscriptionToUserData(sub: StripeSubscriptionLike) {
    const isPro = sub.status === 'active' || sub.status === 'trialing';
    const plan: Plan = isPro ? Plan.pro : Plan.free;
    return {
      stripeSubscriptionId: sub.id,
      stripeSubscriptionStatus: sub.status,
      plan,
      subscriptionCancelAtPeriodEnd: isPro
        ? Boolean(sub.cancel_at_period_end)
        : false,
      subscriptionPeriodEnd:
        isPro && sub.current_period_end != null
          ? new Date(sub.current_period_end * 1000)
          : null,
    };
  }

  async cancelSubscriptionAtPeriodEnd(userId: string): Promise<{
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionId: true },
    });
    if (!user?.stripeSubscriptionId) {
      throw new BadRequestException('Nenhuma assinatura para cancelar.');
    }
    const sub = (await this.stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: true },
    )) as unknown as StripeSubscriptionLike;
    await this.prisma.user.update({
      where: { id: userId },
      data: this.stripeSubscriptionToUserData(sub),
    });
    const end = sub.current_period_end ?? 0;
    return {
      cancelAtPeriodEnd: true,
      currentPeriodEnd: new Date(end * 1000).toISOString(),
    };
  }

  async reactivateSubscription(userId: string): Promise<{
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeSubscriptionId: true },
    });
    if (!user?.stripeSubscriptionId) {
      throw new BadRequestException('Nenhuma assinatura ativa.');
    }
    const sub = (await this.stripe.subscriptions.update(
      user.stripeSubscriptionId,
      { cancel_at_period_end: false },
    )) as unknown as StripeSubscriptionLike;
    await this.prisma.user.update({
      where: { id: userId },
      data: this.stripeSubscriptionToUserData(sub),
    });
    const end = sub.current_period_end ?? 0;
    return {
      cancelAtPeriodEnd: false,
      currentPeriodEnd: new Date(end * 1000).toISOString(),
    };
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string | undefined) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET não configurado');
    }
    if (!signature) {
      throw new BadRequestException('Assinatura ausente');
    }

    let event: ReturnType<StripeClient['webhooks']['constructEvent']>;
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException('Webhook inválido');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as {
          mode: string;
          metadata?: Record<string, string> | null;
          client_reference_id?: string | null;
          subscription: string | { id: string } | null;
          customer: string | { id: string } | null;
        };
        if (session.mode !== 'subscription') break;
        const userId =
          session.metadata?.userId ?? session.client_reference_id ?? undefined;
        const subId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;
        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id;
        if (userId && customerId && subId) {
          const sub = (await this.stripe.subscriptions.retrieve(
            subId,
          )) as unknown as StripeSubscriptionLike;
          await this.prisma.user.update({
            where: { id: userId },
            data: {
              stripeCustomerId: customerId,
              ...this.stripeSubscriptionToUserData(sub),
            },
          });
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as unknown as StripeSubscriptionLike;
        const userId = sub.metadata?.userId;
        const data = this.stripeSubscriptionToUserData(sub);
        if (userId) {
          await this.prisma.user.update({
            where: { id: userId },
            data,
          });
        } else {
          await this.prisma.user.updateMany({
            where: { stripeSubscriptionId: sub.id },
            data,
          });
        }
        break;
      }
      default:
        break;
    }

    return { received: true };
  }
}
