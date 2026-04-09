import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Activity from '@/models/Activity';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const title = req.nextUrl.searchParams.get('title');
    
    // Check if valid ObjectId first
    const isValidId = id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
    
    let activity = isValidId ? await Activity.findById(id).lean() : null;
    
    // Fallback: If not found by ID, try finding by title
    if (!activity && title) {
      activity = await Activity.findOne({ 
        title: { $regex: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }).lean();
    }
    
    if (!activity) {
      return NextResponse.json({ message: 'Activity details unavailable' }, { status: 404 });
    }

    // Normalize _id → id for the frontend
    const normalized = {
      ...activity,
      id: activity._id.toString(),
    };

    return NextResponse.json({ activity: normalized });
  } catch (err) {
    console.error('[GET /api/activities/[id]]', err);
    return NextResponse.json({ message: 'Failed to fetch activity' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    
    // Pick allowed fields to prevent mass assignment/NoSQL injection
    const allowedFields = [
      'title', 'subtitle', 'price', 'originalPrice', 'image', 'category', 
      'duration', 'rating', 'reviewCount', 'badge', 'badgeType', 
      'highlights', 'included', 'timeSlots', 'maxGroupSize', 
      'isComboDeal', 'isActive', 'shortDescription', 'isPackage', 
      'durationDays', 'durationNights', 'gallery', 'pricingRules', 'transportOptions'
    ];
    
    const updateData: any = {};
    allowedFields.forEach(field => {
      if (body[field] !== undefined) updateData[field] = body[field];
    });

    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const activity = await Activity.findByIdAndUpdate(id, updateData, { new: true });
    if (!activity) {
      return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ activity });
  } catch (err) {
    console.error('[PUT /api/activities/[id]]', err);
    return NextResponse.json({ message: 'Failed to update activity' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const activity = await Activity.findByIdAndDelete(id);
    if (!activity) {
      return NextResponse.json({ message: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Activity deleted' });
  } catch (err) {
    console.error('[DELETE /api/activities/[id]]', err);
    return NextResponse.json({ message: 'Failed to delete activity' }, { status: 500 });
  }
}
