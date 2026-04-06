import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Admin key check
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const users = await User.find({}).sort({ createdAt: -1 }).select('-password').lean();
    
    const normalized = users.map((user: any) => ({
      ...user,
      id: user._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json({ users: normalized }, { status: 200 });
  } catch (err) {
    console.error('[GET /api/users]', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
