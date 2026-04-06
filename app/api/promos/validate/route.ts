import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PromoCode from '@/models/PromoCode';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { code, cartTotal, totalGuests, activityId, activityCategory } = await req.json();
    const cleanCode = code?.trim()?.toUpperCase();

    if (!cleanCode) {
      return NextResponse.json({ message: 'Promo code is required' }, { status: 400 });
    }

    const promo = await PromoCode.findOne({ 
      code: cleanCode,
      isActive: true
    });

    if (!promo) {
      return NextResponse.json({ message: 'Invalid promo code' }, { status: 404 });
    }

    // Check expiry
    if (new Date(promo.expiryDate) < new Date()) {
      return NextResponse.json({ message: 'Promo code has expired' }, { status: 400 });
    }

    // Check usage limit
    if (promo.usageCount >= promo.usageLimit) {
      return NextResponse.json({ message: 'Promo code usage limit reached' }, { status: 400 });
    }

    // New: Check Applicability
    if (promo.appliesTo === 'category') {
      if (!promo.categories.includes(activityCategory)) {
        return NextResponse.json({ 
          message: `This code is only valid for activities in the following categories: ${promo.categories.join(', ')}` 
        }, { status: 400 });
      }
    } else if (promo.appliesTo === 'specific') {
      if (!promo.activities.includes(activityId)) {
        return NextResponse.json({ 
          message: 'This code is not valid for the selected activity' 
        }, { status: 400 });
      }
    }

    // Check minimum booking value
    if (cartTotal < promo.minBookingValue) {
      return NextResponse.json({ 
        message: `This code requires a minimum booking value of AED ${promo.minBookingValue}` 
      }, { status: 400 });
    }

    // Check minimum guests
    if (totalGuests < promo.minGuests) {
      return NextResponse.json({ 
        message: `This code requires at least ${promo.minGuests} guests` 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      valid: true, 
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minBookingValue: promo.minBookingValue,
      minGuests: promo.minGuests
    }, { status: 200 });

  } catch (err) {
    console.error('[Promo Validation Error]', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
