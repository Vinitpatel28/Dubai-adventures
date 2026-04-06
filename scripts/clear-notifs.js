
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const BookingSchema = new mongoose.Schema({
  isAdminRead: { type: Boolean, default: false },
}, { timestamps: true });

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

async function clearOldNotifications() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await Booking.updateMany(
      {}, 
      { $set: { isAdminRead: true } }
    );
    
    console.log(`Successfully marked ${result.modifiedCount} existing bookings as read.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearOldNotifications();
