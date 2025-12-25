/**
 * Payments Controller
 * 
 * Handles all payment-related HTTP endpoints.
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateCheckoutDto,
  CreateSubscriptionCheckoutDto,
  RefundPaymentDto,
  CheckPaymentStatusDto,
} from './dto/payment.dto';
import { PaymentProvider } from '@abel-labs/types';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  /**
   * Create a payment checkout session for an invoice
   */
  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment checkout session' })
  async createCheckout(@Body() dto: CreateCheckoutDto) {
    return this.paymentsService.createCheckoutSession(
      dto.invoiceId,
      dto.successUrl,
      dto.cancelUrl,
      dto.provider,
    );
  }

  /**
   * Create a subscription checkout session
   */
  @Post('subscriptions/checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create subscription checkout session' })
  async createSubscriptionCheckout(@Body() dto: CreateSubscriptionCheckoutDto) {
    return this.paymentsService.createSubscriptionCheckout(
      dto.priceId,
      dto.customerEmail,
      dto.customerName,
      dto.successUrl,
      dto.cancelUrl,
      dto.metadata,
    );
  }

  /**
   * Stripe webhook handler
   */
  @Post('webhooks/stripe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      // If no webhook secret is set, allow test requests (for development)
      if (!webhookSecret) {
        console.warn('⚠️ STRIPE_WEBHOOK_SECRET not set - webhook verification skipped');
        // For test requests without signature, return success
        if (!signature) {
          console.log('ℹ️  Test webhook request received (no signature)');
          return { 
            received: true, 
            message: 'Webhook endpoint is working. Set STRIPE_WEBHOOK_SECRET for production.',
            status: 'ok'
          };
        }
        // If signature exists but no secret, try to process anyway (development mode)
        // This won't work without secret, but won't crash
        return { 
          received: true,
          message: 'Webhook received but cannot verify without STRIPE_WEBHOOK_SECRET',
          status: 'test_mode'
        };
      }

      // Production mode: require signature
      if (!signature) {
        console.warn('⚠️ Missing Stripe signature header (test request detected)');
        return { 
          received: true, 
          message: 'Webhook endpoint is accessible. Valid Stripe signature required for real webhooks.',
          status: 'test_mode'
        };
      }

      // Verify and process webhook
      if (!req.rawBody) {
        console.error('❌ Raw body is required for webhook signature verification');
        return { 
          error: 'Raw body is required for webhook signature verification',
          status: 'error'
        };
      }
      
      return await this.paymentsService.processWebhook(
        PaymentProvider.STRIPE,
        req.rawBody as Buffer,
        signature,
      );
    } catch (err: any) {
      console.error('❌ Stripe webhook error:', err.message);
      return { 
        error: err.message,
        status: 'error',
        message: 'Webhook processing failed. Check logs for details.'
      };
    }
  }

  /**
   * Chapa webhook handler
   */
  @Post('webhooks/chapa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chapa webhook handler' })
  async chapaWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: any,
    @Headers('chapa-signature') signature?: string,
  ) {
    try {
      const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET;
      
      // Chapa signature verification is handled in the provider
      if (webhookSecret && signature) {
        console.log('✅ Chapa webhook received with signature - verifying...');
      } else {
        console.log('⚠️ Chapa webhook received without signature verification (development mode)');
      }

      // Process webhook (signature verification happens in provider)
      const payloadBuffer = req.rawBody || Buffer.from(JSON.stringify(payload));
      return await this.paymentsService.processWebhook(
        PaymentProvider.CHAPA,
        payloadBuffer as Buffer,
        signature || '',
      );
    } catch (err: any) {
      console.error('❌ Chapa webhook error:', err.message);
      return {
        error: err.message,
        status: 'error',
      };
    }
  }

  /**
   * Telebirr webhook handler
   */
  @Post('webhooks/telebirr')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Telebirr webhook handler' })
  async telebirrWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: any,
  ) {
    try {
      console.log('✅ Telebirr webhook received');
      
      const payloadBuffer = req.rawBody || Buffer.from(JSON.stringify(payload));
      return await this.paymentsService.processWebhook(
        PaymentProvider.TELEBIRR,
        payloadBuffer as Buffer,
        '', // Telebirr signature handling TBD
      );
    } catch (err: any) {
      console.error('❌ Telebirr webhook error:', err.message);
      return {
        error: err.message,
        status: 'error',
      };
    }
  }

  /**
   * Get payment status
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment status from provider' })
  async getPaymentStatus(@Query() dto: CheckPaymentStatusDto) {
    if (!dto.provider) {
      // Try to detect provider from transaction ID
      if (dto.transactionId.startsWith('cs_') || dto.transactionId.startsWith('pi_')) {
        dto.provider = PaymentProvider.STRIPE;
      } else if (dto.transactionId.startsWith('chapa_')) {
        dto.provider = PaymentProvider.CHAPA;
      } else if (dto.transactionId.startsWith('telebirr_')) {
        dto.provider = PaymentProvider.TELEBIRR;
      } else {
        throw new Error('Cannot determine provider from transaction ID');
      }
    }

    return this.paymentsService.getPaymentStatus(dto.transactionId, dto.provider);
  }

  /**
   * Refund a payment
   */
  @Post('refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund a payment' })
  async refundPayment(@Body() dto: RefundPaymentDto) {
    // Detect provider from transaction ID
    let provider: PaymentProvider;
    if (dto.transactionId.startsWith('cs_') || dto.transactionId.startsWith('pi_')) {
      provider = PaymentProvider.STRIPE;
    } else {
      throw new Error('Refunds are currently only supported for Stripe payments');
    }

    return this.paymentsService.refundPayment(dto.transactionId, provider, dto.amount);
  }

  /**
   * Get payment history for current user
   */
  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment history for current user' })
  async getPaymentHistory(@Req() req, @Query('status') status?: string, @Query('provider') provider?: string) {
    return this.paymentsService.getPaymentHistory(req.user.id, req.user.role, status, provider);
  }
}
