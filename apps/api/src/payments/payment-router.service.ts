/**
 * Payment Router Service
 * 
 * Routes payments to the correct provider based on currency.
 * This is the main entry point for all payment operations.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Currency, PaymentProvider } from '@abel-labs/types';
import { StripeProvider } from './providers/stripe.provider';
import { ETBProvider } from './providers/etb.provider';
import { IPaymentProvider } from './interfaces/payment-provider.interface';

@Injectable()
export class PaymentRouterService {
  private readonly logger = new Logger(PaymentRouterService.name);
  private providers: Map<PaymentProvider, IPaymentProvider> = new Map();

  constructor(
    private stripeProvider: StripeProvider,
    private chapaProvider: ETBProvider,
  ) {
    // Register providers
    this.providers.set(PaymentProvider.STRIPE, stripeProvider);
    
    // For ETB, default to Chapa (can be configured)
    // In production, you might want to make this configurable
    const etbProvider = process.env.ETB_PAYMENT_PROVIDER || 'CHAPA';
    if (etbProvider === 'CHAPA') {
      this.providers.set(PaymentProvider.CHAPA, chapaProvider);
    } else if (etbProvider === 'TELEBIRR') {
      // Use Chapa provider for Telebirr (will be replaced when Telebirr is fully implemented)
      // The ETBProvider can handle both Chapa and Telebirr
      const telebirrProvider = new ETBProvider(PaymentProvider.TELEBIRR);
      this.providers.set(PaymentProvider.TELEBIRR, telebirrProvider);
    }
  }

  /**
   * Route payment to correct provider based on currency
   */
  routeByCurrency(currency: Currency): IPaymentProvider {
    switch (currency) {
      case Currency.CAD:
      case Currency.USD:
        return this.providers.get(PaymentProvider.STRIPE)!;
      
      case Currency.ETB:
        // Default to Chapa, but can be configured
        const etbProvider = process.env.ETB_PAYMENT_PROVIDER || 'CHAPA';
        if (etbProvider === 'TELEBIRR') {
          return this.providers.get(PaymentProvider.TELEBIRR) || this.providers.get(PaymentProvider.CHAPA)!;
        }
        return this.providers.get(PaymentProvider.CHAPA)!;
      
      default:
        throw new Error(`Unsupported currency: ${currency}`);
    }
  }

  /**
   * Get provider by name
   */
  getProvider(provider: PaymentProvider): IPaymentProvider {
    const paymentProvider = this.providers.get(provider);
    if (!paymentProvider) {
      throw new Error(`Provider not found: ${provider}`);
    }
    return paymentProvider;
  }

  /**
   * Get all registered providers
   */
  getAllProviders(): IPaymentProvider[] {
    return Array.from(this.providers.values());
  }
}

