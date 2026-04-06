import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AISettings from '@/models/AISettings';

export async function GET() {
  try {
    await dbConnect();
    let settings = await AISettings.findOne();
    if (!settings) {
      settings = await AISettings.create({});
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching AI settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const key = req.headers.get('x-admin-key');
    if (key !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await req.json();
    let settings = await AISettings.findOne();
    
    if (!settings) {
      settings = await AISettings.create(data);
    } else {
      settings = await AISettings.findOneAndUpdate({}, data, { new: true });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating AI settings' }, { status: 500 });
  }
}
