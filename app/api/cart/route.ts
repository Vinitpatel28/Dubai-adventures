import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is missing');

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ cart: [] }, { status: 200 });

    const decoded: any = jwt.verify(token, JWT_SECRET!);
    const userId = decoded.id || decoded.userId;
    if (!userId) return NextResponse.json({ cart: [] }, { status: 401 });

    await dbConnect();
    const user = await User.findById(userId).select('cart');
    if (!user) return NextResponse.json({ cart: [] }, { status: 401 });

    return NextResponse.json({ cart: user.cart || [] });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ cart: [] }, { status: 200 }); // Graceful fallback to guest behavior
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Login required' }, { status: 401 });

    const decoded: any = jwt.verify(token, JWT_SECRET!);
    const userId = decoded.id || decoded.userId;
    if (!userId) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    const { items } = await req.json();

    await dbConnect();
    const user = await User.findByIdAndUpdate(userId, { cart: items }, { new: true });
    
    return NextResponse.json({ message: 'Cart updated', cart: user.cart });
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ message: 'Update failed' }, { status: 500 });
  }
}
