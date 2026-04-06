
import mongoose from 'mongoose';
import dbConnect from './lib/mongodb';
import Booking from './models/Booking';
import dotenv from 'dotenv';
import path from 'path';

// Load env from the main app directory (assuming we are in the root)
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function clearOldNotifications() {
  try {
    await dbConnect();
    console.log('Connected to MongoDB');
    
    // Mark ALL existing bookings as read once to start fresh
    const result = await Booking.updateMany(
      { isAdminRead: { $ne: true } }, 
      { $set: { isAdminRead: true } }
    );
    
    console.log(`Successfully cleared ${result.modifiedCount} old notifications.`);
    process.exit(0);
  } catch (error) {
    console.error('Error clearing notifications:', error);
    process.exit(1);
  }
}

clearOldNotifications();
