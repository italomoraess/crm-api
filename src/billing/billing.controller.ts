import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SkipSubscription } from './decorators/skip-subscription.decorator';
import { BillingService } from './billing.service';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @ApiBearerAuth()
  @SkipSubscription()
  @Post('checkout-session')
  @ApiOperation({ summary: 'Cria sessão Stripe Checkout para assinatura' })
  async createCheckoutSession(@CurrentUser() user: { userId: string }) {
    return this.billingService.createCheckoutSession(user.userId);
  }

  @ApiBearerAuth()
  @SkipSubscription()
  @Post('cancel-subscription')
  @ApiOperation({ summary: 'Agenda cancelamento da assinatura ao fim do período pago' })
  async cancelSubscription(@CurrentUser() user: { userId: string }) {
    return this.billingService.cancelSubscriptionAtPeriodEnd(user.userId);
  }

  @ApiBearerAuth()
  @SkipSubscription()
  @Post('reactivate-subscription')
  @ApiOperation({ summary: 'Revoga cancelamento agendado (mantém assinatura)' })
  async reactivateSubscription(@CurrentUser() user: { userId: string }) {
    return this.billingService.reactivateSubscription(user.userId);
  }

  @Public()
  @SkipThrottle()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook Stripe (assinatura)' })
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ) {
    const raw = req.rawBody;
    if (!raw) {
      throw new BadRequestException('Corpo bruto ausente');
    }
    return this.billingService.handleStripeWebhook(raw, signature);
  }
}
