import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia' as any,
});

// Service pricing (server-side validation - never trust client prices)
const SERVICE_PRICING: Record<string, { cad: number; usd: number }> = {
  'landing-page': { cad: 599, usd: 449 },
  'full-website': { cad: 1499, usd: 1099 },
  'ecommerce': { cad: 3500, usd: 2625 },
  'mobile-app': { cad: 7000, usd: 5250 },
};

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Parse and validate request body
    const body = await request.json();
    const { serviceType, amount, currency, customerEmail, customerName } = body;

    // Input validation
    if (!serviceType || !customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceType, customerEmail, customerName' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate currency
    const validCurrencies = ['CAD', 'USD'];
    const normalizedCurrency = (currency || 'CAD').toUpperCase();
    if (!validCurrencies.includes(normalizedCurrency)) {
      return NextResponse.json(
        { error: 'Invalid currency. Must be CAD or USD' },
        { status: 400 }
      );
    }

    // Get server-side price (never trust client-provided amount)
    const servicePrice = SERVICE_PRICING[serviceType];
    if (!servicePrice) {
      return NextResponse.json(
        { error: `Invalid service type: ${serviceType}` },
        { status: 400 }
      );
    }

    // Use server-side price based on currency
    const serverAmount = normalizedCurrency === 'CAD' 
      ? servicePrice.cad 
      : servicePrice.usd;

    // Additional validation: client amount should match server amount (with small tolerance for rounding)
    if (amount && Math.abs(amount - serverAmount) > 1) {
      console.warn(`⚠️ Price mismatch: client=${amount}, server=${serverAmount}`);
      // Still use server amount for security
    }

    // Convert to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(serverAmount * 100);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment', // One-time payment only
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: normalizedCurrency.toLowerCase(),
            product_data: {
              name: 'Abel Labs – Service Payment',
              description: `Service: ${serviceType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        serviceType,
        customerName,
        source: 'website',
        amount: serverAmount.toString(),
        currency: normalizedCurrency,
      },
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancel`,
      // Test mode is determined by the API key (sk_test_* = test, sk_live_* = live)
    });

    console.log(`✅ Checkout session created: ${session.id} for ${customerEmail}`);

    // Return the session URL for redirect
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    });

  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error);
    
    // Return user-friendly error message
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create payment session. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

