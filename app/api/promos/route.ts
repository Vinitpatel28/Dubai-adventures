import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PromoCode from '@/models/PromoCode';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const adminKey = req.headers.get('x-admin-key');
    const isAdmin = adminKey === process.env.ADMIN_SECRET_KEY;

    // If admin, return everything. If public, return only active and non-expired.
    const query = isAdmin ? {} : { isActive: { $ne: false }, expiryDate: { $gt: new Date() } };
    const promosRaw = await PromoCode.find(query).sort({ createdAt: -1 }).lean();
    
    // Normalize _id → id for easy frontend usage
    const promos = promosRaw.map((p: any) => ({
      ...p,
      id: p._id.toString()
    }));

    return NextResponse.json({ promos });
  } catch (err) {
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { _id, id, ...cleanBody } = body;
    const promo = await PromoCode.create(cleanBody);
    return NextResponse.json({ promo }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: 'Error creating promo' }, { status: 500 });
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
    const id = body._id || body.id;
    console.log('[Main App API] Attempting Absolute PUT for ID:', id);
    console.log('[Main App API] Incoming Content:', body);

    if (!id || id === 'undefined') {
      return NextResponse.json({ message: 'Missing Document ID' }, { status: 400 });
    }

    // Manual fetching and individual field saving is more reliable during schema evolution
    const promoDoc = await PromoCode.findById(id);
    
    if (!promoDoc) {
      console.warn('[Main App API] No document matched ID for save:', id);
      return NextResponse.json({ message: 'Promo not found in DB' }, { status: 404 });
    }

    // Map each field explicitly to ensure they are assigned correctly with types
    promoDoc.code = String(body.code || promoDoc.code).toUpperCase();
    promoDoc.description = body.description !== undefined ? String(body.description) : promoDoc.description;
    promoDoc.discountType = body.discountType || promoDoc.discountType;
    promoDoc.discountValue = Number(body.discountValue) || 0;
    promoDoc.expiryDate = body.expiryDate ? new Date(body.expiryDate) : promoDoc.expiryDate;
    promoDoc.usageLimit = Number(body.usageLimit) || 100;
    promoDoc.usageCount = Number(body.usageCount) || 0; // Added usageCount assignment
    promoDoc.minBookingValue = Number(body.minBookingValue) || 0;
    promoDoc.minGuests = Number(body.minGuests) || 0;
    promoDoc.appliesTo = body.appliesTo || promoDoc.appliesTo;
    promoDoc.activities = Array.isArray(body.activities) ? body.activities : promoDoc.activities;
    promoDoc.categories = Array.isArray(body.categories) ? body.categories : promoDoc.categories;
    promoDoc.isFeatured = body.isFeatured === true;
    promoDoc.isActive = body.isActive !== false;

    console.log('[Main App API] Modified Doc before save:', promoDoc.toObject());
    const saved = await promoDoc.save();
    console.log('[Main App API] Save Confirmed for:', saved.code);

    return NextResponse.json({ promo: saved });
  } catch (err: any) {
    console.error('[Main App API] Critical Failure in PUT:', err);
    return NextResponse.json({ message: `Database error: ${err.message}` }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await PromoCode.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (err) {
    return NextResponse.json({ message: 'Error deleting promo' }, { status: 500 });
  }
}
