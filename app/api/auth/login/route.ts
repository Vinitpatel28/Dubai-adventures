import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { validateEmail } from '@/lib/validation';
import { checkRateLimitMiddleware } from '@/lib/rateLimit';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

export async function POST(req: Request) {
  // Rate limiting
  const nextReq = req as unknown as NextRequest;
  const rateLimitResponse = checkRateLimitMiddleware(nextReq, 5, 15 * 60 * 1000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json({ message: 'Logged in', user: { id: user._id.toString(), name: user.name, email: user.email } }, { status: 200 });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error', error);
    return NextResponse.json({ message: 'Login failed. Please try again.' }, { status: 500 });
  }
}
