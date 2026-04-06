import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GlobalOperation from '@/models/GlobalOperation';

// Authentication (Admin-only)
const adminKey = process.env.ADMIN_SECRET_KEY;
if (!adminKey) throw new Error('ADMIN_SECRET_KEY environment variable is missing');

export async function GET() {
  await dbConnect();
  try {
    let ops = await GlobalOperation.findOne();
    if (!ops) {
      ops = await GlobalOperation.create({ pricingRules: [], blackoutDates: [] });
    }
    return NextResponse.json({ success: true, operation: ops }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const key = req.headers.get('x-admin-key');
  if (key !== adminKey) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  try {
    const data = await req.json();
    let ops = await GlobalOperation.findOne();

    if (ops) {
      // Prevent Mongoose CastErrors and immutable _id update exceptions
      delete data._id;
      delete data.__v;
      if (Array.isArray(data.pricingRules)) {
        data.pricingRules.forEach((r: any) => delete r._id);
      }
      if (Array.isArray(data.blackoutDates)) {
        data.blackoutDates.forEach((r: any) => delete r._id);
      }
      
      ops.set(data);
      await ops.save();
    } else {
      ops = await GlobalOperation.create(data);
    }

    return NextResponse.json({ success: true, operation: ops }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
