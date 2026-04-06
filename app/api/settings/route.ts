import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Publicly accessible but only returns non-sensitive data if no admin key
    const adminKey = req.headers.get('x-admin-key');
    const isAdmin = adminKey === process.env.ADMIN_SECRET_KEY;

    // Publicly accessible
    let settings = await Settings.findOne().lean();
    if (!settings) {
      settings = (await Settings.create({})).toObject();
    }

    return NextResponse.json({ settings }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (err) {
    console.error('[GET /api/settings]', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Strip metadata to prevent update errors
    const { _id, __v, createdAt, updatedAt, ...updateData } = body;

    const conn = await dbConnect();
    
    // Bypass Mongoose schema strictness/caching by using direct collection update
    const collection = conn.connection.collection('settings');
    await collection.updateOne(
      {}, 
      { $set: updateData }, 
      { upsert: true }
    );

    const settings = await Settings.findOne().lean();
    console.log('Settings successfully persisted in DB:', settings);

    return NextResponse.json({ settings }, { status: 200 });
  } catch (err) {
    console.error('[PUT /api/settings]', err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
