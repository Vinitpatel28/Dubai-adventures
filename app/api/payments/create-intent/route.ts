import { NextResponse, NextRequest } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { applyCORS } from '@/lib/cors';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe only if key is available
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-01-27' as any,
}) : null;

export async function POST(req: NextRequest) {
  // Check for required environment variable at request time
  if (!stripeSecretKey || !stripe) {
    return NextResponse.json(
      { error: 'Payment service not configured' },
      { status: 503 }
    );
  }
  try {
    await dbConnect();
    const { bookingId, email } = await req.json();

    if (!bookingId) {
      const response = NextResponse.json({ message: 'Booking ID is required' }, { status: 400 });
      return applyCORS(response, req);
    }

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      const response = NextResponse.json({ message: 'Booking not found' }, { status: 404 });
      return applyCORS(response, req);
    }

    // Use the price stored in DB, NEVER trust the client amount
    const amount = booking.totalPrice;

    if (!amount || amount < 50) { // Dubai minimums usually higher
      const response = NextResponse.json({ message: 'Invalid booking amount' }, { status: 400 });
      return applyCORS(response, req);
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses minor units (fils)
      currency: 'aed',
      metadata: { 
        bookingId,
        email: email || booking.email
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    const response = NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      transactionId: paymentIntent.id
    });
    return applyCORS(response, req);
  } catch (err: any) {
    console.error('[STRIPE ERROR]', err);
    // Don't expose internal error details to client
    const response = NextResponse.json({ 
      message: 'Payment processing failed. Please try again or contact support.' 
    }, { status: 500 });
    return applyCORS(response, req);
  }
}
