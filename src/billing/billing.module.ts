import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { SubscriptionService } from './subscription.service';

@Module({
  controllers: [BillingController],
  providers: [BillingService, SubscriptionService],
  exports: [SubscriptionService],
})
export class BillingModule {}
