import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27' as any,
});

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { bookingId, email } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ message: 'Booking ID is required' }, { status: 400 });
    }

    const booking = await Booking.findOne({ bookingId });
    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    // Use the price stored in DB, NEVER trust the client amount
    const amount = booking.totalPrice;

    if (!amount || amount < 50) { // Dubai minimums usually higher
      return NextResponse.json({ message: 'Invalid booking amount' }, { status: 400 });
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

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      transactionId: paymentIntent.id
    });
  } catch (err: any) {
    console.error('[STRIPE ERROR]', err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
