import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ActivityModel from '@/models/Activity';

// GET /api/activities  — list all (with optional ?category=xxx&active=true)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('active') !== 'false';

    const query: Record<string, unknown> = {};
    if (activeOnly) query.isActive = true;
    if (category && category !== 'all') query.category = category;

    const activities = await ActivityModel.find(query)
      .select('title subtitle price originalPrice image category duration rating reviewCount badge badgeType isActive isComboDeal shortDescription')
      .sort({ rating: -1, createdAt: -1 })
      .lean();

    // Normalize _id → id for the frontend
    const normalized = activities.map(({ _id, ...rest }) => ({
      id: _id.toString(),
      ...rest,
    }));

    // Note: Premium manual ordering can be replaced by a 'priority' field in the model later.
    // For now, we use the Database-sorted order (Rating based).

    return NextResponse.json({ activities: normalized });
  } catch (err) {
    console.error('[GET /api/activities]', err);
    return NextResponse.json({ message: 'Failed to fetch activities' }, { status: 500 });
  }
}

// POST /api/activities  — create new activity (admin only)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // Basic admin key check (use a proper auth middleware in production)
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const activity = await ActivityModel.create(body);
    return NextResponse.json({ activity }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/activities]', err);
    return NextResponse.json({ message: 'Failed to create activity' }, { status: 500 });
  }
}
