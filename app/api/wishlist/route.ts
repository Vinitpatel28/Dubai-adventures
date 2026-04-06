import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    await dbConnect();
    const userId = await getUser();
    if (!userId) {
      return NextResponse.json({ wishlist: [] }, { status: 200 });
    }

    const user = await User.findById(userId);
    return NextResponse.json({ wishlist: user?.wishlist || [] }, { status: 200 });
  } catch (error) {
    console.error('Wishlist GET Error', error);
    return NextResponse.json({ message: 'Error fetching wishlist' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const userId = await getUser();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { activityId } = await req.json();
    if (!activityId) {
      return NextResponse.json({ message: 'Activity ID is required' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const wishlist = user.wishlist || [];
    const index = wishlist.indexOf(activityId);

    if (index > -1) {
      // Remove from wishlist
      wishlist.splice(index, 1);
    } else {
      // Add to wishlist
      wishlist.push(activityId);
    }

    user.wishlist = wishlist;
    await user.save();

    return NextResponse.json({ wishlist: user.wishlist }, { status: 200 });
  } catch (error) {
    console.error('Wishlist POST Error', error);
    return NextResponse.json({ message: 'Error updating wishlist' }, { status: 500 });
  }
}
