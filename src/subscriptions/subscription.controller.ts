import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionService } from './subscription.service';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly config: ConfigService,
  ) {}

  @Get('plans')
  getPlans() {
    return this.subscriptionService.getPlans().then(plans => ({
      plans,
      paymentQrCodeUrl: this.config.get<string>('PAYMENT_QR_CODE_URL') || null,
    }));
  }
}
