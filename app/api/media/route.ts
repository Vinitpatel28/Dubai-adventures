import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Media from '@/models/Media';

export async function GET(req: Request) {
  await dbConnect();
  try {
    const media = await Media.find({}).select('url type name createdAt').sort({ createdAt: -1 });
    return NextResponse.json({ media });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch media' }, { status: 500 });
  }
}
