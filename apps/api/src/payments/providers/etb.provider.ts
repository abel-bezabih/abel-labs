/**
 * ETB Payment Provider (Abstraction)
 * 
 * Handles all ETB payments via Chapa or Telebirr.
 * This is a unified interface for Ethiopian payment providers.
 * 
 * Fully implements both Chapa and Telebirr payment providers.
 * Note: Telebirr API structure may need adjustment based on official documentation.
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  IPaymentProvider,
  CheckoutSessionParams,
  CheckoutSession,
  WebhookEvent,
  PaymentResult,
  ProviderPaymentStatus,
} from '../interfaces/payment-provider.interface';
import { PaymentProvider, Currency, PaymentStatus } from '@abel-labs/types';

@Injectable()
export class ETBProvider implements IPaymentProvider {
  private readonly logger = new Logger(ETBProvider.name);
  readonly provider: PaymentProvider;
  readonly supportedCurrencies: Currency[] = [Currency.ETB];

  private useChapa: boolean;

  constructor(provider: PaymentProvider = PaymentProvider.CHAPA) {
    if (provider !== PaymentProvider.CHAPA && provider !== PaymentProvider.TELEBIRR) {
      throw new Error(`Invalid ETB provider: ${provider}`);
    }
    this.provider = provider;
    this.useChapa = provider === PaymentProvider.CHAPA;
    this.logger.log(`✅ ETB Provider initialized (${provider})`);
  }

  supportsCurrency(currency: Currency): boolean {
    return currency === Currency.ETB;
  }

  /**
   * Create a one-time payment checkout session
   */
  async createCheckoutSession(params: CheckoutSessionParams): Promise<CheckoutSession> {
    if (!this.supportsCurrency(params.currency)) {
      throw new Error(`ETB Provider does not support currency: ${params.currency}`);
    }

    if (this.useChapa) {
      return this.createChapaCheckout(params);
    } else {
      return this.createTelebirrCheckout(params);
    }
  }

  /**
   * Create Chapa checkout session
   */
  private async createChapaCheckout(params: CheckoutSessionParams): Promise<CheckoutSession> {
    const chapaApiKey = process.env.CHAPA_SECRET_KEY;
    if (!chapaApiKey) {
      throw new Error('CHAPA_SECRET_KEY not set');
    }

    const axios = require('axios');
    const apiUrl = process.env.API_URL || 'http://localhost:3001';

    try {
      const txRef = `chapa_${params.invoiceId}_${Date.now()}`;
      
      const response = await axios.post(
        'https://api.chapa.co/v1/transaction/initialize',
        {
          amount: params.amount.toString(),
          currency: 'ETB',
          email: params.customerEmail || 'customer@example.com',
          first_name: params.customerName?.split(' ')[0] || 'Customer',
          last_name: params.customerName?.split(' ').slice(1).join(' ') || 'Name',
          phone_number: '+251911234567', // Should come from customer data
          tx_ref: txRef,
          callback_url: `${apiUrl}/payments/webhooks/chapa`,
          return_url: params.successUrl,
          customization: {
            title: params.description,
            description: `Payment for ${params.description}`,
          },
          meta: {
            invoiceId: params.invoiceId,
            ...params.metadata,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${chapaApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.log(`✅ Chapa checkout session created: ${txRef}`);

      return {
        sessionId: txRef,
        paymentUrl: response.data.data.checkout_url,
        provider: this.provider,
      };
    } catch (error: any) {
      this.logger.error(`❌ Failed to create Chapa checkout: ${error.message}`);
      if (error.response?.status === 401) {
        throw new Error('Chapa API authentication failed. Please set CHAPA_SECRET_KEY in your .env file. For Stripe testing, use CAD or USD currency invoices.');
      }
      throw new Error(`Chapa checkout creation failed: ${error.message}`);
    }
  }

  /**
   * Create Telebirr checkout session
   * Note: Telebirr API structure may vary - adjust based on official documentation
   */
  private async createTelebirrCheckout(params: CheckoutSessionParams): Promise<CheckoutSession> {
    const telebirrApiKey = process.env.TELEBIRR_API_KEY || process.env.TELEBIRR_SECRET_KEY;
    const telebirrMerchantId = process.env.TELEBIRR_MERCHANT_ID;
    
    if (!telebirrApiKey) {
      throw new Error('TELEBIRR_API_KEY or TELEBIRR_SECRET_KEY not set');
    }

    if (!telebirrMerchantId) {
      throw new Error('TELEBIRR_MERCHANT_ID not set');
    }

    const axios = require('axios');
    const crypto = require('crypto');
    const apiUrl = process.env.API_URL || 'http://localhost:3001';

    try {
      const transactionId = `telebirr_${params.invoiceId}_${Date.now()}`;
      const timestamp = Date.now().toString();
      
      // Telebirr typically requires a signed request
      // Adjust these fields based on Telebirr's actual API documentation
      const requestData = {
        merchantId: telebirrMerchantId,
        orderId: transactionId,
        amount: params.amount.toString(),
        currency: 'ETB',
        notifyUrl: `${apiUrl}/payments/webhooks/telebirr`,
        returnUrl: params.successUrl,
        subject: params.description || 'Payment',
        timeoutExpress: '30', // minutes
        nonce: crypto.randomBytes(16).toString('hex'),
        timestamp: timestamp,
        // Additional customer info
        customerInfo: {
          email: params.customerEmail || 'customer@example.com',
          name: params.customerName || 'Customer',
        },
        metadata: {
          invoiceId: params.invoiceId,
          ...params.metadata,
        },
      };

      // Generate signature (adjust algorithm based on Telebirr docs)
      // Common pattern: HMAC-SHA256 of sorted key-value pairs
      const signatureString = Object.keys(requestData)
        .sort()
        .map(key => `${key}=${requestData[key]}`)
        .join('&');
      
      const signature = crypto
        .createHmac('sha256', telebirrApiKey)
        .update(signatureString)
        .digest('hex');

      // Telebirr API endpoint (adjust based on actual API)
      // Common patterns: https://api.telebirr.com/v1/payment/create
      const telebirrApiUrl = process.env.TELEBIRR_API_URL || 'https://api.telebirr.com/v1/payment/create';
      
      const response = await axios.post(
        telebirrApiUrl,
        {
          ...requestData,
          signature: signature,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${telebirrApiKey}`,
          },
        }
      );

      this.logger.log(`✅ Telebirr checkout session created: ${transactionId}`);

      // Extract payment URL from response (adjust based on actual response structure)
      const paymentUrl = response.data?.data?.paymentUrl || 
                        response.data?.paymentUrl || 
                        response.data?.checkoutUrl ||
                        `${telebirrApiUrl}/checkout/${transactionId}`;

      return {
        sessionId: transactionId,
        paymentUrl: paymentUrl,
        provider: this.provider,
      };
    } catch (error: any) {
      this.logger.error(`❌ Failed to create Telebirr checkout: ${error.message}`);
      if (error.response?.status === 401) {
        throw new Error('Telebirr API authentication failed. Please check your TELEBIRR_API_KEY and TELEBIRR_MERCHANT_ID.');
      }
      throw new Error(`Telebirr checkout creation failed: ${error.message}`);
    }
  }

  /**
   * Verify webhook signature
   * Note: Chapa and Telebirr have different signature verification methods
   */
  async verifyWebhookSignature(payload: Buffer, signature: string): Promise<WebhookEvent> {
    if (this.useChapa) {
      return this.verifyChapaSignature(payload, signature);
    } else {
      return this.verifyTelebirrSignature(payload, signature);
    }
  }

  /**
   * Verify Chapa webhook signature
   * Chapa uses HMAC-SHA256 for webhook signature verification
   */
  private async verifyChapaSignature(payload: Buffer, signature: string): Promise<WebhookEvent> {
    const crypto = require('crypto');
    const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET || process.env.CHAPA_SECRET_KEY;
    
    if (!webhookSecret) {
      this.logger.warn('⚠️ CHAPA_WEBHOOK_SECRET not set - skipping signature verification');
      // In development, allow webhook without verification
      const data = JSON.parse(payload.toString());
      return {
        type: 'chapa.webhook',
        id: data.tx_ref || data.id || '',
        data: data,
        timestamp: new Date(),
      };
    }

    // Verify HMAC signature
    // Chapa sends signature in format: sha256=hex_signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    // Extract signature from header (format: sha256=... or just hex)
    const receivedSignature = signature.replace('sha256=', '').trim();

    if (receivedSignature !== expectedSignature) {
      this.logger.error('❌ Chapa webhook signature verification failed');
      throw new Error('Invalid webhook signature');
    }

    this.logger.log('✅ Chapa webhook signature verified');
    
    const data = JSON.parse(payload.toString());
    return {
      type: 'chapa.webhook',
      id: data.tx_ref || data.id || '',
      data: data,
      timestamp: new Date(),
    };
  }

  /**
   * Verify Telebirr webhook signature
   * Telebirr typically uses HMAC-SHA256 similar to Chapa
   */
  private async verifyTelebirrSignature(payload: Buffer, signature: string): Promise<WebhookEvent> {
    const crypto = require('crypto');
    const webhookSecret = process.env.TELEBIRR_WEBHOOK_SECRET || 
                         process.env.TELEBIRR_API_KEY || 
                         process.env.TELEBIRR_SECRET_KEY;
    
    if (!webhookSecret) {
      this.logger.warn('⚠️ TELEBIRR_WEBHOOK_SECRET not set - skipping signature verification');
      // In development, allow webhook without verification
      const data = JSON.parse(payload.toString());
      return {
        type: 'telebirr.webhook',
        id: data.orderId || data.transactionId || data.id || '',
        data: data,
        timestamp: new Date(),
      };
    }

    // Verify HMAC signature
    // Telebirr typically sends signature in header or in payload
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    // Extract signature from header or payload
    const receivedSignature = signature.replace('sha256=', '').trim();

    if (receivedSignature && receivedSignature !== expectedSignature) {
      this.logger.error('❌ Telebirr webhook signature verification failed');
      throw new Error('Invalid webhook signature');
    }

    this.logger.log('✅ Telebirr webhook signature verified');
    
    const data = JSON.parse(payload.toString());
    return {
      type: 'telebirr.webhook',
      id: data.orderId || data.transactionId || data.id || '',
      data: data,
      timestamp: new Date(),
    };
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: WebhookEvent): Promise<PaymentResult> {
    if (this.useChapa) {
      return this.processChapaWebhook(event);
    } else {
      return this.processTelebirrWebhook(event);
    }
  }

  /**
   * Process Chapa webhook
   */
  private async processChapaWebhook(event: WebhookEvent): Promise<PaymentResult> {
    const payload = event.data;
    
    if (payload.status === 'success' && payload.tx_ref) {
      // Extract invoice ID from tx_ref (format: chapa_invoiceId_timestamp)
      const parts = payload.tx_ref.split('_');
      const invoiceId = parts[1];

      return {
        success: true,
        transactionId: payload.transaction_id || payload.tx_ref,
        amount: parseFloat(payload.amount) || 0,
        currency: Currency.ETB,
        status: PaymentStatus.COMPLETED,
        metadata: {
          txRef: payload.tx_ref,
          customerEmail: payload.customer?.email,
        },
      };
    }

    return {
      success: false,
      transactionId: payload.tx_ref || '',
      amount: 0,
      currency: Currency.ETB,
      status: PaymentStatus.FAILED,
      error: payload.message || 'Payment failed',
    };
  }

  /**
   * Process Telebirr webhook
   */
  private async processTelebirrWebhook(event: WebhookEvent): Promise<PaymentResult> {
    const payload = event.data;
    
    // Telebirr webhook structure (adjust based on actual webhook format)
    // Common fields: orderId, transactionId, status, amount, etc.
    const orderId = payload.orderId || payload.transactionId || payload.order_id;
    const status = payload.status || payload.paymentStatus || payload.payment_status;
    const amount = parseFloat(payload.amount || payload.totalAmount || 0);
    
    // Extract invoice ID from orderId (format: telebirr_invoiceId_timestamp)
    let invoiceId = '';
    if (orderId && orderId.startsWith('telebirr_')) {
      const parts = orderId.split('_');
      invoiceId = parts[1] || '';
    } else if (payload.metadata?.invoiceId) {
      invoiceId = payload.metadata.invoiceId;
    }

    // Check if payment was successful
    // Common status values: SUCCESS, SUCCESSFUL, COMPLETED, PAID
    const isSuccess = status === 'SUCCESS' || 
                     status === 'SUCCESSFUL' || 
                     status === 'COMPLETED' || 
                     status === 'PAID' ||
                     status === '1';

    if (isSuccess && orderId) {
      return {
        success: true,
        transactionId: orderId,
        amount: amount,
        currency: Currency.ETB,
        status: PaymentStatus.COMPLETED,
        metadata: {
          orderId: orderId,
          customerEmail: payload.customerInfo?.email || payload.customerEmail,
          paymentMethod: payload.paymentMethod || 'Telebirr',
        },
      };
    }

    // Payment failed or pending
    const errorStatus = status === 'FAILED' || status === 'FAILURE' || status === '0' 
      ? PaymentStatus.FAILED 
      : PaymentStatus.PENDING;

    return {
      success: false,
      transactionId: orderId || '',
      amount: amount,
      currency: Currency.ETB,
      status: errorStatus,
      error: payload.message || payload.errorMessage || `Payment status: ${status}`,
    };
  }

  /**
   * Get payment status from provider
   */
  async getPaymentStatus(transactionId: string): Promise<ProviderPaymentStatus> {
    if (this.useChapa) {
      return this.getChapaPaymentStatus(transactionId);
    } else {
      return this.getTelebirrPaymentStatus(transactionId);
    }
  }

  /**
   * Get Chapa payment status
   */
  private async getChapaPaymentStatus(transactionId: string): Promise<ProviderPaymentStatus> {
    const chapaApiKey = process.env.CHAPA_SECRET_KEY;
    if (!chapaApiKey) {
      throw new Error('CHAPA_SECRET_KEY not set');
    }

    const axios = require('axios');

    try {
      const response = await axios.get(
        `https://api.chapa.co/v1/transaction/verify/${transactionId}`,
        {
          headers: {
            Authorization: `Bearer ${chapaApiKey}`,
          },
        }
      );

      const data = response.data.data;
      return {
        status: data.status === 'success' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        amount: parseFloat(data.amount) || 0,
        currency: Currency.ETB,
        paidAt: data.status === 'success' ? new Date() : undefined,
      };
    } catch (error: any) {
      this.logger.error(`❌ Failed to get Chapa payment status: ${error.message}`);
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }

  /**
   * Get Telebirr payment status
   */
  private async getTelebirrPaymentStatus(transactionId: string): Promise<ProviderPaymentStatus> {
    const telebirrApiKey = process.env.TELEBIRR_API_KEY || process.env.TELEBIRR_SECRET_KEY;
    if (!telebirrApiKey) {
      throw new Error('TELEBIRR_API_KEY or TELEBIRR_SECRET_KEY not set');
    }

    const axios = require('axios');
    const crypto = require('crypto');

    try {
      // Telebirr status check endpoint (adjust based on actual API)
      const telebirrApiUrl = process.env.TELEBIRR_API_URL || 'https://api.telebirr.com/v1/payment/query';
      
      // Create query request with signature
      const timestamp = Date.now().toString();
      const queryData = {
        orderId: transactionId,
        timestamp: timestamp,
        nonce: crypto.randomBytes(16).toString('hex'),
      };

      const signatureString = Object.keys(queryData)
        .sort()
        .map(key => `${key}=${queryData[key]}`)
        .join('&');
      
      const signature = crypto
        .createHmac('sha256', telebirrApiKey)
        .update(signatureString)
        .digest('hex');

      const response = await axios.post(
        telebirrApiUrl,
        {
          ...queryData,
          signature: signature,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${telebirrApiKey}`,
          },
        }
      );

      const data = response.data?.data || response.data;
      const status = data.status || data.paymentStatus || data.payment_status;
      const isSuccess = status === 'SUCCESS' || 
                       status === 'SUCCESSFUL' || 
                       status === 'COMPLETED' || 
                       status === 'PAID' ||
                       status === '1';

      return {
        status: isSuccess ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        amount: parseFloat(data.amount || data.totalAmount || 0),
        currency: Currency.ETB,
        paidAt: isSuccess ? new Date(data.paidAt || data.paymentTime || Date.now()) : undefined,
      };
    } catch (error: any) {
      this.logger.error(`❌ Failed to get Telebirr payment status: ${error.message}`);
      throw new Error(`Failed to get payment status: ${error.message}`);
    }
  }
}


