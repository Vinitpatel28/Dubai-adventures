import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

// TypeScript type guard - JWT_SECRET is guaranteed to be a string after the check above
const JWT_SECRET_SAFE = JWT_SECRET as string;

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    
    let userId = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const decoded = jwt.verify(token, JWT_SECRET_SAFE) as any;
      // Handle both old tokens (id) and new tokens (userId)
      userId = decoded.userId || decoded.id;
    } catch {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const booking = await Booking.findOne({ _id: id, userId });
    
    if (!booking) {
      return NextResponse.json({ message: 'Booking not found or not authorized' }, { status: 404 });
    }

    booking.status = 'cancelled';
    await booking.save();

    return NextResponse.json({ message: 'Booking cancelled successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Cancel Booking Error:', error);
    return NextResponse.json({ message: 'Failed to cancel booking' }, { status: 500 });
  }
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    
    const booking = await Booking.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!booking) return NextResponse.json({ message: 'Booking not found' }, { status: 404 });

    return NextResponse.json({ booking });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
