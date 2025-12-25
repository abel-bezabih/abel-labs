import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentRouterService } from './payment-router.service';
import { StripeProvider } from './providers/stripe.provider';
import { ETBProvider } from './providers/etb.provider';
import { PaymentProvider } from '@abel-labs/types';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'payments',
    }),
    NotificationsModule,
    InvoicesModule,
  ],
  controllers: [PaymentsController],
  providers: [
    // Payment providers
    StripeProvider,
    {
      provide: 'CHAPA_PROVIDER',
      useFactory: () => new ETBProvider(PaymentProvider.CHAPA),
    },
    // Router service (needs providers)
    {
      provide: PaymentRouterService,
      useFactory: (stripeProvider: StripeProvider, chapaProvider: any) => {
        // chapaProvider is injected as ETBProvider instance
        return new PaymentRouterService(stripeProvider, chapaProvider);
      },
      inject: [StripeProvider, 'CHAPA_PROVIDER'],
    },
    // Main payment service
    PaymentsService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
