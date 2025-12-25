import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia' as any,
});

// Disable body parsing - we need raw body for webhook signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('⚠️ STRIPE_WEBHOOK_SECRET not set - webhook verification skipped');
      // In development, allow webhooks without verification
      if (process.env.NODE_ENV === 'development') {
        const body = await request.json();
        console.log('📥 Webhook received (dev mode, no verification):', body.type);
        return NextResponse.json({ received: true });
      }
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      console.error('❌ Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    console.log(`✅ Webhook verified: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('💰 Payment completed:', {
        sessionId: session.id,
        customerEmail: session.customer_email,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency,
        metadata: session.metadata,
      });

      // TODO: Update your database here
      // Example:
      // await prisma.payment.create({
      //   data: {
      //     sessionId: session.id,
      //     customerEmail: session.customer_email,
      //     amount: session.amount_total ? session.amount_total / 100 : 0,
      //     currency: session.currency?.toUpperCase(),
      //     serviceType: session.metadata?.serviceType,
      //     status: 'PAID',
      //   },
      // });

      // TODO: Send confirmation email to customer
      // await sendEmail({
      //   to: session.customer_email,
      //   subject: 'Payment Confirmed - Abel Labs',
      //   body: 'Your payment has been received...',
      // });

      // TODO: Notify admin
      // await notifyAdmin({
      //   message: `New payment received: ${session.amount_total / 100} ${session.currency}`,
      // });

      console.log('✅ Payment processed successfully');
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

