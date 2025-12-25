/**
 * Payment Service (Orchestrator)
 * 
 * Main service that orchestrates all payment operations.
 * Uses PaymentRouterService to route to correct provider.
 * Handles database operations and business logic.
 */

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { prisma } from '@abel-labs/database';
import { PaymentProvider, PaymentStatus, Currency } from '@abel-labs/types';
import { NotificationsService } from '../notifications/notifications.service';
import { PaymentRouterService } from './payment-router.service';
import { CheckoutSessionParams, SubscriptionCheckoutParams } from './interfaces/payment-provider.interface';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectQueue('payments') private paymentsQueue: Queue,
    private notificationsService: NotificationsService,
    private paymentRouter: PaymentRouterService,
    private invoicesService: InvoicesService,
  ) {}

  /**
   * Create a payment checkout session for an invoice
   */
  async createCheckoutSession(
    invoiceId: string,
    successUrl?: string,
    cancelUrl?: string,
    providerOverride?: PaymentProvider,
  ) {
    try {
      this.logger.log(`🔍 Creating checkout session for invoice: ${invoiceId}`);
      
      // Get invoice - try by ID first, then by invoice number
      let invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          project: {
            include: {
              client: true,
            },
          },
        },
      });

      // If not found by ID, try by invoice number
      if (!invoice) {
        this.logger.log(`🔍 Invoice not found by ID, trying invoice number: ${invoiceId}`);
        invoice = await prisma.invoice.findFirst({
          where: { invoiceNumber: invoiceId },
          include: {
            project: {
              include: {
                client: true,
              },
            },
          },
        });
      }

      if (!invoice) {
        this.logger.error(`❌ Invoice not found: ${invoiceId}`);
        throw new NotFoundException(`Invoice with ID or number "${invoiceId}" not found`);
      }

      this.logger.log(`✅ Found invoice: ${invoice.invoiceNumber} (${invoice.currency}, ${invoice.amount})`);

      // Check if invoice is already paid
      if (invoice.status === 'PAID') {
        throw new BadRequestException('Invoice is already paid');
      }

      // Validate invoice has project
      if (!invoice.project) {
        this.logger.error(`❌ Invoice ${invoice.invoiceNumber} has no associated project`);
        throw new BadRequestException(`Invoice ${invoice.invoiceNumber} has no associated project`);
      }

      // Route to correct provider based on currency
      const provider = providerOverride 
        ? this.paymentRouter.getProvider(providerOverride)
        : this.paymentRouter.routeByCurrency(invoice.currency as Currency);
      this.logger.log(`🔀 Routing to provider: ${provider.provider} for currency: ${invoice.currency}`);
      
      // Build return URLs
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const defaultSuccessUrl = `${baseUrl}/payments/success?invoice=${invoiceId}`;
      const defaultCancelUrl = `${baseUrl}/payments/cancel?invoice=${invoiceId}`;

      // Prepare checkout parameters
      const checkoutParams: CheckoutSessionParams = {
        invoiceId: invoice.id,
        amount: invoice.amount,
        currency: invoice.currency as Currency,
        customerEmail: invoice.project?.client?.email,
        customerName: invoice.project?.client?.name,
        description: `Invoice ${invoice.invoiceNumber}`,
        successUrl: successUrl || defaultSuccessUrl,
        cancelUrl: cancelUrl || defaultCancelUrl,
        metadata: {
          invoiceNumber: invoice.invoiceNumber,
          projectId: invoice.projectId,
        },
      };

      this.logger.log(`💳 Creating checkout session with provider: ${provider.provider}`);
      
      // Create checkout session via provider
      const checkoutSession = await provider.createCheckoutSession(checkoutParams);

      this.logger.log(`✅ Checkout session created: ${checkoutSession.sessionId}`);

      // Create pending payment record
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: invoice.amount,
          currency: invoice.currency as Currency,
          provider: provider.provider,
          status: PaymentStatus.PENDING,
          transactionId: checkoutSession.sessionId,
          metadata: {
            paymentUrl: checkoutSession.paymentUrl,
            expiresAt: checkoutSession.expiresAt?.toISOString(),
          },
        },
      });

      this.logger.log(`✅ Checkout session created for invoice ${invoice.invoiceNumber}`);

      return checkoutSession;
    } catch (error: any) {
      this.logger.error(`❌ Failed to create checkout session: ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);
      
      // Re-throw known exceptions
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      // Wrap unknown errors
      throw new BadRequestException(
        error.message || 'Failed to create checkout session. Check server logs for details.'
      );
    }
  }

  /**
   * Create a subscription checkout session
   */
  async createSubscriptionCheckout(
    priceId: string,
    customerEmail: string,
    customerName?: string,
    successUrl?: string,
    cancelUrl?: string,
    metadata?: Record<string, string>,
  ) {
    // Only Stripe supports subscriptions
    const provider = this.paymentRouter.getProvider(PaymentProvider.STRIPE);
    
    if (!provider.createSubscriptionCheckout) {
      throw new BadRequestException('Subscriptions are only supported via Stripe');
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const defaultSuccessUrl = `${baseUrl}/subscriptions/success`;
    const defaultCancelUrl = `${baseUrl}/subscriptions/cancel`;

    const subscriptionParams: SubscriptionCheckoutParams = {
      priceId,
      customerEmail,
      customerName,
      successUrl: successUrl || defaultSuccessUrl,
      cancelUrl: cancelUrl || defaultCancelUrl,
      metadata,
    };

    const checkoutSession = await provider.createSubscriptionCheckout(subscriptionParams);

    this.logger.log(`✅ Subscription checkout session created for ${customerEmail}`);

    return checkoutSession;
  }

  /**
   * Process webhook event from payment provider
   */
  async processWebhook(provider: PaymentProvider, payload: Buffer, signature: string) {
    const paymentProvider = this.paymentRouter.getProvider(provider);

    // Verify webhook signature
    const event = await paymentProvider.verifyWebhookSignature(payload, signature);

    // Process the webhook event
    const result = await paymentProvider.processWebhookEvent(event);

    if (result.success) {
      // Record payment in database
      await this.recordPayment(result, provider);

      this.logger.log(`✅ Payment processed: ${result.transactionId}`);
    } else {
      this.logger.warn(`⚠️ Payment failed: ${result.transactionId} - ${result.error}`);
    }

    return result;
  }

  /**
   * Record payment in database
   */
  private async recordPayment(
    result: { transactionId: string; amount: number; currency: Currency; status: PaymentStatus; metadata?: Record<string, any> },
    provider: PaymentProvider,
  ) {
    // Try to find existing payment by transaction ID
    const existingPayment = await prisma.payment.findFirst({
      where: { transactionId: result.transactionId },
    });

    if (existingPayment) {
      // Update existing payment
      const updated = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: result.status,
          metadata: result.metadata || {},
        },
      });
      this.logger.log(`✅ Payment updated: ${result.transactionId}`);

      if (result.status === PaymentStatus.COMPLETED && updated.invoiceId) {
        await this.updateInvoiceStatus(updated.invoiceId);
        await this.sendPaymentNotifications(updated.invoiceId, updated.id, result.amount, result.currency);
      }
      return;
    }

    // Get invoice ID from metadata
    const invoiceId = result.metadata?.invoiceId;
    if (!invoiceId) {
      this.logger.warn(`⚠️ No invoice ID in payment metadata: ${result.transactionId}`);
      return;
    }

    // Create new payment record
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount: result.amount,
        currency: result.currency,
        provider,
        status: result.status,
        transactionId: result.transactionId,
        metadata: result.metadata || {},
      },
    });

    // Update invoice status if fully paid
    await this.updateInvoiceStatus(invoiceId);

    // Queue notification job
    await this.paymentsQueue.add('payment-confirmed', {
      paymentId: payment.id,
      invoiceId,
    });

    await this.sendPaymentNotifications(invoiceId, payment.id, result.amount, result.currency);

    this.logger.log(`✅ Payment recorded: ${payment.id}`);
  }

  private async sendPaymentNotifications(invoiceId: string, paymentId: string, amount: number, currency: Currency) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!invoice) return;

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@abellabs.ca';
    await this.notificationsService.notifyPaymentReceived(paymentId, adminEmail, amount, currency);

    const clientEmail = invoice.project?.client?.email;
    if (clientEmail && invoice.status === 'PAID') {
      const portalUrl = process.env.CLIENT_PORTAL_URL || 'http://localhost:3000';
      const apiUrl = process.env.API_URL || process.env.BACKEND_URL || 'http://localhost:3001';
      const downloadUrl = `${apiUrl}/invoices/${invoiceId}/pdf`;
      const dashboardUrl = `${portalUrl}/dashboard`;

      try {
        // Generate PDF for attachment
        const pdfBuffer = await this.invoicesService.generatePdf(invoiceId);
        
        await this.notificationsService.notifyPaymentReceipt(
          clientEmail,
          invoice.invoiceNumber,
          amount,
          currency,
          downloadUrl,
          dashboardUrl,
          pdfBuffer,
        );
        this.logger.log(`✅ Payment receipt sent to ${clientEmail} with PDF attachment`);
      } catch (error: any) {
        this.logger.error(`⚠️ Failed to generate PDF for receipt: ${error.message}`);
        // Still send receipt without PDF if PDF generation fails
        await this.notificationsService.notifyPaymentReceipt(
          clientEmail,
          invoice.invoiceNumber,
          amount,
          currency,
          downloadUrl,
          dashboardUrl,
        );
      }
    }
  }

  /**
   * Update invoice status based on payments
   */
  private async updateInvoiceStatus(invoiceId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        project: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!invoice) return null;

    // Calculate total paid
    const totalPaid = await prisma.payment.aggregate({
      where: {
        invoiceId,
        status: PaymentStatus.COMPLETED,
      },
      _sum: { amount: true },
    });

    const paidAmount = totalPaid._sum.amount || 0;

    // Update invoice status
    if (paidAmount >= invoice.amount) {
      const updated = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
        include: {
          project: {
            include: {
              client: true,
            },
          },
        },
      });
      this.logger.log(`✅ Invoice ${invoice.invoiceNumber} marked as PAID`);
      return updated;
    } else if (paidAmount > 0) {
      // Partially paid
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'SENT' }, // Keep as SENT if partially paid
      });
    }
    
    return null;
  }

  /**
   * Get payment status from provider
   */
  async getPaymentStatus(transactionId: string, provider: PaymentProvider) {
    const paymentProvider = this.paymentRouter.getProvider(provider);
    return await paymentProvider.getPaymentStatus(transactionId);
  }

  /**
   * Refund a payment
   */
  async refundPayment(transactionId: string, provider: PaymentProvider, amount?: number) {
    const paymentProvider = this.paymentRouter.getProvider(provider);
    
    if (!paymentProvider.refundPayment) {
      throw new BadRequestException(`Refunds not supported for provider: ${provider}`);
    }

    const result = await paymentProvider.refundPayment(transactionId, amount);

    if (result.success) {
      // Update payment status in database
      const payment = await prisma.payment.findFirst({
        where: { transactionId },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.REFUNDED,
            metadata: {
              ...(payment.metadata as Record<string, any> || {}),
              refundId: result.refundId,
              refundAmount: result.amount,
              refundedAt: new Date().toISOString(),
            },
          },
        });

        // Update invoice status
        await this.updateInvoiceStatus(payment.invoiceId);
      }
    }

    return result;
  }

  /**
   * Get payment history for a user
   */
  async getPaymentHistory(userId: string, userRole: string, status?: string, provider?: string) {
    const where: any = {};

    // If user is a CLIENT, only show payments for their projects
    if (userRole === 'CLIENT') {
      where.invoice = {
        project: {
          clientId: userId,
        },
      };
    }

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Filter by provider if provided
    if (provider) {
      where.provider = provider;
    }

    return prisma.payment.findMany({
      where,
      include: {
        invoice: {
          include: {
            project: {
              include: {
                client: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
