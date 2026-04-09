import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

// Type guard for TypeScript
const token_secret = JWT_SECRET as string;

export async function GET(req: Request) {
  try {
    await dbConnect();

    let userId = null;
    let userEmail = null;

    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      if (token) {
        const decoded = jwt.verify(token, token_secret) as any;
        // Handle both old tokens (id) and new tokens (userId)
        userId = decoded.userId || decoded.id;
        
        const user = await User.findById(userId).select('email').lean();
        userEmail = (user as { email?: string } | null)?.email;
      }
    } catch (e) {
      return NextResponse.json({
        error: 'Not authenticated',
        message: 'Please log in to debug bookings'
      }, { status: 401 });
    }

    if (!userId || !userEmail) {
      return NextResponse.json({
        error: 'No user found',
        message: 'Could not find user email in database'
      }, { status: 404 });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Check all bookings in the system
    const totalBookings = await Booking.countDocuments();
    
    // Query by userId
    const bookingsByUserId = await Booking.find({ userId: userObjectId })
      .sort({ createdAt: -1 }).select('-__v').lean();

    // Query by email
    const bookingsByEmail = await Booking.find({ email: userEmail })
      .sort({ createdAt: -1 }).select('-__v').lean();

    // Query with $or (like the actual page does)
    const bookingsByOr = await Booking.find({
      $or: [{ userId: userObjectId }, { email: userEmail }]
    }).sort({ createdAt: -1 }).select('-__v').lean();

    // Get sample bookings to see structure
    const sampleBookings = await Booking.find().limit(3).lean();

    return NextResponse.json({
      currentUser: {
        userId,
        userEmail,
        userObjectId: userObjectId.toString()
      },
      totalBookingsInSystem: totalBookings,
      queryResults: {
        byUserId: bookingsByUserId.length,
        byEmail: bookingsByEmail.length,
        byOr: bookingsByOr.length
      },
      bookings: {
        byUserId: bookingsByUserId.map(b => ({
          _id: b._id,
          bookingId: b.bookingId,
          email: b.email,
          userId: b.userId?.toString(),
          activityTitle: b.activityTitle,
          date: b.date,
          status: b.status,
          createdAt: b.createdAt
        })),
        byEmail: bookingsByEmail.map(b => ({
          _id: b._id,
          bookingId: b.bookingId,
          email: b.email,
          userId: b.userId?.toString(),
          activityTitle: b.activityTitle,
          date: b.date,
          status: b.status,
          createdAt: b.createdAt
        }))
      },
      diagnosis: {
        hasBookings: bookingsByOr.length > 0,
        message: bookingsByOr.length > 0 
          ? `✅ Found ${bookingsByOr.length} bookings! They should show on the bookings page.`
          : `❌ No bookings found. The query $or matched 0 results.`,
        details: {
          'Bookings with your userId': bookingsByUserId.length,
          'Bookings with your email': bookingsByEmail.length,
          'Combined (what page uses)': bookingsByOr.length,
          'Total bookings in system': totalBookings
        }
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Debug error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
