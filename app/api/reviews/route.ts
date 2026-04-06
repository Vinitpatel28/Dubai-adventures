import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import Review from '@/models/Review';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is missing');

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as { userId: string; name: string; email: string };
    return decoded;
  } catch { return null; }
}

// GET /api/reviews?activityId=xxx
export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const activityId = searchParams.get('activityId');
    const query = activityId ? { activityId } : {};

    const reviews = await Review.find(query).sort({ createdAt: -1 }).limit(100).lean();
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Reviews GET Error', error);
    return NextResponse.json({ message: 'Error fetching reviews' }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(req: Request) {
  try {
    await dbConnect();
    const user = await getUser();
    const body = await req.json();
    const { activityId, rating, title, comment, authorName } = body;

    // Security: Only allow specific fields and force state
    if (!activityId || !rating || !title || !comment) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1-5' }, { status: 400 });
    }

    const review = await Review.create({
      activityId,
      userId: user?.userId || null,
      authorName: user?.name || authorName || 'Anonymous',
      rating,
      title,
      comment,
      verified: !!user,
      helpfulCount: 0 // Security: Reset to 0 regardless of body
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Reviews POST Error', error);
    return NextResponse.json({ message: 'Error creating review' }, { status: 500 });
  }
}
