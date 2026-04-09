import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

// TypeScript type guard - JWT_SECRET is guaranteed to be a string after the check above
const JWT_SECRET_SAFE = JWT_SECRET as string;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET_SAFE);
    
    // Fallback for older tokens that used userId instead of id
    if (!decoded.id && decoded.userId) {
      decoded.id = decoded.userId;
    }

    return NextResponse.json({ user: decoded }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }
}
