import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { validateEmail, validatePassword, getPasswordFeedback } from '@/lib/validation';
import { checkRateLimitMiddleware } from '@/lib/rateLimit';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required');

// TypeScript type guard - JWT_SECRET is guaranteed to be a string after the check above
const JWT_SECRET_SAFE = JWT_SECRET as string;

export async function POST(req: Request) {
  // Rate limiting
  const nextReq = req as unknown as NextRequest;
  const rateLimitResponse = checkRateLimitMiddleware(nextReq, 5, 15 * 60 * 1000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({
        message: getPasswordFeedback(password)
      }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign({ userId: user._id.toString(), email: user.email, name: user.name }, JWT_SECRET_SAFE, { expiresIn: '7d' });

    const response = NextResponse.json({ message: 'User created', user: { id: user._id.toString(), name: user.name, email: user.email } }, { status: 201 });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error', error);
    return NextResponse.json({ message: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
