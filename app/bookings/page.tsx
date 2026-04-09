import dbConnect from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Category from "@/models/Category";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import BookingsClient from "./BookingsClient";

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

async function getBookingsData() {
  await dbConnect();
  
  let userId = null;
  let isAuthenticated = false;
  let userEmail = null;
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      // Handle both old tokens (id) and new tokens (userId)
      userId = decoded.userId || decoded.id;
      isAuthenticated = true;
    }
  } catch (e) {
    // invalid token
  }

  let userBookings: any[] = [];
  
  if (userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const user = await User.findById(userObjectId).select('email').lean();
    userEmail = (user as { email?: string } | null)?.email;

    const query = userEmail
      ? { $or: [{ userId: userObjectId }, { email: userEmail }] }
      : { userId: userObjectId };

    userBookings = await Booking.find(query).sort({ createdAt: -1 }).lean();

    if (userBookings.length > 0) {
      const allActivityIds = new Set(userBookings.map(b => b.activityId).filter(id => mongoose.isValidObjectId(id)));
      const comboActivityIds = userBookings.flatMap(b => b.comboItems?.map((item: any) => item.activityId) || []).filter(id => mongoose.isValidObjectId(id));
      
      const uniqueIds = Array.from(new Set([...allActivityIds, ...comboActivityIds]));
      
      if (uniqueIds.length > 0) {
        const activities = await Activity.find({ _id: { $in: uniqueIds } }).select('_id category image').lean();
        const activityMap = new Map((activities as any[]).map(a => [a._id.toString(), a]));
        
        for (const booking of userBookings) {
          const mainActivity = activityMap.get(booking.activityId);
          booking.category = mainActivity?.category || (booking.activityId === 'custom-combo' ? 'combo' : 'all');

          if (booking.comboItems && booking.comboItems.length > 0) {
            booking.comboGallery = booking.comboItems.map((item: any) => activityMap.get(item.activityId)?.image).filter(Boolean);
          }
        }
      }
    }
  }

  const categories = await Category.find().sort({ order: 1 }).lean();

  return {
    bookings: JSON.parse(JSON.stringify(userBookings)),
    categories: JSON.parse(JSON.stringify(categories)),
    isAuthenticated,
    userEmail: userEmail || null
  };
}

export default async function BookingsPage() {
  const { bookings, categories, isAuthenticated, userEmail } = await getBookingsData();

  return (
    <BookingsClient 
      initialBookings={bookings} 
      categories={categories} 
      isAuthenticated={isAuthenticated}
      userEmail={userEmail}
    />
  );
}
