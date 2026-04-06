import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import PromoCode from '@/models/PromoCode';
import GlobalOperation from '@/models/GlobalOperation';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import { sendBookingNotification, sendVoucherToCustomer } from '@/lib/email';

const JWT_SECRET = (process.env.JWT_SECRET as string) || (process.env.NODE_ENV === 'development' ? 'dev_secret' : undefined);
if (!JWT_SECRET) throw new Error('JWT_SECRET is missing');

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const { 
      activityId, activityTitle, date, timeSlot, adults, children, 
      totalPrice, fullName, email, phone, promoCode,
      comboItems,
      isPackageBooking, packageStartDate, packageEndDate, durationDays, durationNights
    } = body;

    if (!activityId || !date || !timeSlot || !fullName || !email || !phone) {
      return NextResponse.json({ message: 'Missing required booking fields' }, { status: 400 });
    }

    // ── Server-Side Real-Time Validation ──
    const now = new Date();
    const dubaiOffset = 4;
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const dubaiNow = new Date(utcTime + (3600000 * dubaiOffset));
    const currentMins = dubaiNow.getHours() * 60 + dubaiNow.getMinutes();

    const bookingDate = new Date(date);
    const isToday = bookingDate.toDateString() === dubaiNow.toDateString();

    if (isToday) {
      // Basic time parser for common formats (10:00 AM, 15:00)
      const parseMins = (str: string) => {
        const clean = str.toUpperCase().trim();
        const match = clean.match(/(\d+):?(\d+)?\s*(AM|PM)?/);
        if (!match) return 0;
        let h = parseInt(match[1]);
        const m = match[2] ? parseInt(match[2]) : 0;
        const ampm = match[3];
        if (ampm === "PM" && h < 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        return h * 60 + m;
      };

      const slotMins = parseMins(timeSlot);
      if (slotMins < currentMins + 15) { // 15-min graceful buffer on server
        return NextResponse.json({ message: 'This time slot is no longer available. Please select a later time.' }, { status: 400 });
      }
    }
    // ──────────────────────────────────────────

    let userId = null;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as { userId: string };
        userId = decoded.userId;
      } catch {
        // Log the error but continue as guest if token is invalid
        console.warn('Invalid token during booking, proceeding as guest');
      }
    }

    const bookingId = `DXB-${Date.now().toString(36).toUpperCase()}`;

    // 1. Fetch activity to get title, price and group limits
    const isCustomCombo = activityId === 'custom-combo';
    const BookingActivity = !isCustomCombo && mongoose.isValidObjectId(activityId) 
      ? await mongoose.model('Activity').findById(activityId) 
      : null;
    
    if (!BookingActivity && !isCustomCombo) {
      return NextResponse.json({ message: 'Experience verification failed. Please try again.' }, { status: 400 });
    }

    // 2. CAPACITY CHECK (Professional Overbooking Prevention)
    if (BookingActivity) {
      const existingBookings = await Booking.find({
        activityId: activityId,
        date: new Date(date),
        timeSlot: timeSlot,
        status: 'confirmed'
      });

      const currentGuests = existingBookings.reduce((sum, b) => sum + (b.adults || 0) + (b.children || 0), 0);
      const requestedGuests = (adults || 0) + (children || 0);

      if (currentGuests + requestedGuests > BookingActivity.maxGroupSize) {
        return NextResponse.json({ 
          message: `Booking Failed: Only ${BookingActivity.maxGroupSize - currentGuests} spots remaining for this time slot.` 
        }, { status: 400 });
      }
    }

    // 2.5 GLOBAL OPERATIONS CHECK (Master Manifest Sync)
    const globalOps = await GlobalOperation.findOne();
    const selDateObj = new Date(date);
    selDateObj.setHours(0,0,0,0);

    if (globalOps) {
       // Check for Blackouts
       const isBlackout = globalOps.blackoutDates.find(b => 
          b.isActive && new Date(b.date).toDateString() === selDateObj.toDateString() && (b.applyToAll || b.targetActivityIds.includes(activityId))
       );
       if (isBlackout) {
          return NextResponse.json({ message: `Service Interruption: Operations are currently paused for this date (${isBlackout.reason || 'Safety/Logistics'}).` }, { status: 400 });
       }
    }

    // 3. PRICE VERIFICATION (Security: Don't trust the client-side price)
    let finalPrice = 0;
    let baseTotal = 0;

    if (isCustomCombo && comboItems?.length > 0) {
      // Custom Combo logic: Sum of parts with a 10% "Saver" discount
      for (const item of comboItems) {
        const act = await mongoose.model('Activity').findById(item.activityId);
        if (act) {
          baseTotal += (adults * act.price) + (children * act.price * 0.5);
        }
      }
      // Apply 10% Combo Builder Discount
      finalPrice = baseTotal * 0.9;
    } else if (BookingActivity) {
      // Standard Single Activity logic with Dynamic Surcharges
      let currentPrice = BookingActivity.price;
      
      // 1. Dynamic Surcharges (Server-side re-verification)
      if (date) {
        const selDate = new Date(date);
        selDate.setHours(0,0,0,0);
        
        // 1.a Activity-Specific Rules
        if (BookingActivity.pricingRules) {
          const rule = BookingActivity.pricingRules.find((r: any) => {
            if (r.type === 'date' && r.date) return new Date(r.date).toDateString() === selDate.toDateString();
            if (r.type === 'weekend') return selDate.getDay() === 0 || selDate.getDay() === 6;
            return false;
          });
          if (rule) currentPrice += rule.adjustment;
        }

        // 1.b Global Operational Rules
        if (globalOps && globalOps.pricingRules) {
           const gRule = globalOps.pricingRules.find(r => {
             if (!r.isActive) return false;
             if (!r.applyToAll && !r.targetActivityIds.includes(activityId)) return false;
             
             if (r.type === 'date' && r.date) return new Date(r.date).toDateString() === selDate.toDateString();
             if (r.type === 'weekend') return selDate.getDay() === 0 || selDate.getDay() === 6;
             if (r.type === 'fixed_holiday' && r.date) {
               const [m, d] = r.date.split('-');
               return (selDate.getMonth() + 1) === parseInt(m) && selDate.getDate() === parseInt(d);
             }
             return false;
           });
           if (gRule) {
             if (gRule.adjustmentType === 'fixed') currentPrice += gRule.adjustment;
             else currentPrice += (BookingActivity.price * (gRule.adjustment / 100));
           }
        }
      }

      baseTotal = (adults * currentPrice) + (children * currentPrice * 0.5);
      
      // 2. Transport Add-ons
      if (body.selectedTransportIndex !== undefined && BookingActivity.transportOptions) {
        const opt = BookingActivity.transportOptions[body.selectedTransportIndex];
        if (opt) {
          baseTotal += opt.isPerPerson ? (opt.price * (adults + children)) : opt.price;
        }
      }

      finalPrice = baseTotal;
    } else {
      return NextResponse.json({ message: 'Pricing model could not be verified' }, { status: 400 });
    }

    // Promo Code Verification
    let discountAmount = baseTotal - finalPrice; // Current savings (e.g. from combo)
    const submittedCode = typeof promoCode === 'string' ? promoCode : promoCode?.code;

    if (submittedCode) {
      const promo = await PromoCode.findOne({ 
        code: submittedCode.toUpperCase(), 
        isActive: true,
        expiryDate: { $gt: new Date() } 
      });

      if (promo) {
        const canApply = 
          (!promo.minBookingValue || baseTotal >= promo.minBookingValue) &&
          (!promo.minGuests || (adults + children) >= promo.minGuests);

        if (canApply) {
          let promoDiscount = 0;
          if (promo.discountType === 'percentage') {
            promoDiscount = (baseTotal * (promo.discountValue / 100));
          } else {
            promoDiscount = promo.discountValue;
          }
          finalPrice -= promoDiscount;
          discountAmount += promoDiscount;
        }
      }
    }

    if (finalPrice < 0) finalPrice = 0;

    const resolvedTitle = activityTitle || BookingActivity?.title || (isCustomCombo ? 'Custom Super Saver Combo' : 'Dubai Experience');

    const newBooking = await Booking.create({
      bookingId,
      activityId,
      activityTitle: resolvedTitle,
      date: new Date(date),
      timeSlot,
      adults,
      children,
      totalPrice: finalPrice, // Re-verified on server
      fullName,
      email,
      phone,
      userId,
      promoCode: submittedCode || null,
      discountAmount: Math.round(discountAmount), 
      paymentMethod: null,
      paymentStatus: 'pending', 
      transactionId: null,
      status: 'pending',
      isAdminRead: false,
      comboItems: comboItems || [],
      selectedTransportIndex: body.selectedTransportIndex || null,
      pickupLocation: body.pickupLocation || null,
      dropoffLocation: body.dropoffLocation || null,
      specialRequirements: body.specialRequirements || "",
      isPackageBooking: isPackageBooking || false,
      packageStartDate: packageStartDate ? new Date(packageStartDate) : null,
      packageEndDate: packageEndDate ? new Date(packageEndDate) : null,
      durationDays: durationDays || 0,
      durationNights: durationNights || 0
    });

    // Fire-and-forget email notifications (Internal & Client)
    sendBookingNotification(newBooking).catch(console.error);
    sendVoucherToCustomer(newBooking).catch(console.error);

    return NextResponse.json({ message: 'Booking successful', booking: newBooking }, { status: 201 });
  } catch (error: unknown) {
    console.error('Booking Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ message: 'Failed to create booking', error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    // ── Admin bypass: if valid admin key is present, return ALL bookings ──
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey === process.env.ADMIN_SECRET_KEY) {
      const allBookings = await Booking.find({}).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ bookings: allBookings }, { status: 200 });
    }

    // ── Regular user: return their own bookings only ──
    let userId = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as { userId: string };
      userId = decoded.userId;
    } catch {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const user = await User.findById(userObjectId).select('email').lean();
    const userEmail = (user as { email?: string } | null)?.email;

    const query = userEmail
      ? { $or: [{ userId: userObjectId }, { email: userEmail }] }
      : { userId: userObjectId };

    const userBookings = await Booking.find(query)
      .populate({
        path: 'activityId',
        model: 'Activity',
        select: 'category image title'
      })
      .sort({ createdAt: -1 })
      .lean() as any[];

    // Map the populated data to the expected flat structure if needed, or update consumers
    for (const booking of userBookings) {
      if (booking.activityId && typeof booking.activityId === 'object') {
        booking.category = booking.activityId.category || (booking.activityId === 'custom-combo' ? 'combo' : 'all');
        if (booking.comboItems && booking.comboItems.length > 0) {
          // Note: Full gallery stitching would still need the map approach for comboItems, 
          // but for the main activity, populate is cleaner.
        }
      }
    }

    return NextResponse.json({ bookings: userBookings }, { status: 200 });
  } catch (error: unknown) {
    console.error('Fetch Bookings Error:', error);
    return NextResponse.json({ message: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // ── Case A: Admin bypass (Mark as read) ──
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey === process.env.ADMIN_SECRET_KEY) {
      if (body.bookingIds && Array.isArray(body.bookingIds)) {
        await Booking.updateMany(
          { _id: { $in: body.bookingIds } },
          { $set: { isAdminRead: true } }
        );
        return NextResponse.json({ message: 'Bookings marked as read' }, { status: 200 });
      }
    }

    // ── Case B: Regular User Update (Date/Slot) ──
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    // Verify user ID from token
    const decoded = jwt.verify(token, JWT_SECRET as string) as unknown as { userId: string };
    const { bookingId, date, timeSlot, adults, children } = body;

    // Use findById for single document manipulation
    const booking = await Booking.findById(bookingId);
    if (!booking) return NextResponse.json({ message: 'Adventures document not found' }, { status: 404 });

    // Verify ownership
    if (booking.userId?.toString() !== decoded.userId) {
      return NextResponse.json({ message: 'This adventure belongs to another traveler' }, { status: 403 });
    }

    // Only allow modification if status permits
    if (['cancelled', 'refunded'].includes(booking.status)) {
      return NextResponse.json({ message: 'Completed or cancelled adventures cannot be adjusted' }, { status: 400 });
    }

    // ── Rescheduling Guards ──
    const now = new Date();
    const dubaiOffset = 4;
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const dubaiNow = new Date(utcTime + (3600000 * dubaiOffset));
    const startOfToday = new Date(dubaiNow.setHours(0,0,0,0));

    // 1. Don't allow rescheduling if it's less than 24h before the ORIGINAL date
    const originalDate = new Date(booking.date);
    const hoursToTrip = (originalDate.getTime() - now.getTime()) / 3600000;
    if (hoursToTrip < 24) {
      return NextResponse.json({ message: 'Rescheduling is locked within 24 hours of the adventure.' }, { status: 403 });
    }

    if (date) {
      const newDate = new Date(date);
      // 2. Prevent choosing a past date
      if (newDate < startOfToday) {
        return NextResponse.json({ message: 'You cannot travel to the past!' }, { status: 400 });
      }
      booking.date = newDate;
    }
    if (timeSlot) booking.timeSlot = timeSlot;

    // If guest counts change, we should try to recalculate price
    if (typeof adults === 'number' || typeof children === 'number') {
        const adultsVal = typeof adults === 'number' ? adults : booking.adults;
        const childrenVal = typeof children === 'number' ? children : booking.children;
        
        // Fetch activity to get base price
        const activity = await mongoose.model('Activity').findById(booking.activityId);
        if (activity) {
            // Standard pricing: Adults 100%, Children 50%
            const newTotal = (adultsVal * activity.price) + (childrenVal * activity.price * 0.5);
            booking.totalPrice = newTotal;
        }
        
        booking.adults = adultsVal;
        booking.children = childrenVal;
    }

    await booking.save();
    return NextResponse.json({ message: 'Success! Your adventure has been updated.', booking });

  } catch (error: any) {
    console.error('[API] Booking PATCH Error:', error);
    return NextResponse.json({ message: error.message || 'Operation failed' }, { status: 500 });
  }
}
