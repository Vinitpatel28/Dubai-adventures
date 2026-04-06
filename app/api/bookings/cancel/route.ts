import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { bookingId, reason } = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const booking = await Booking.findById(bookingId);
    if (!booking) return NextResponse.json({ message: 'Adventure not found' }, { status: 404 });

    if (booking.userId?.toString() !== decoded.userId) {
      return NextResponse.json({ message: 'Authorization error' }, { status: 403 });
    }

    if (['cancelled', 'refunded', 'pending_cancellation'].includes(booking.status)) {
      return NextResponse.json({ message: 'Request already in progress or completed' }, { status: 400 });
    }

    // Update status to pending_cancellation
    booking.status = 'pending_cancellation';
    // We could also store the reason in a new field if schema allows, but for now just update status
    await booking.save();

    return NextResponse.json({ 
      message: 'Cancellation request submitted. Our team will review and contact you shortly.',
      status: 'pending_cancellation' 
    });

  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error processing request' }, { status: 500 });
  }
}
