import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const health = {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
      mainApi: 'operational',
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(health, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: 'Health check failed' }, { status: 500 });
  }
}
