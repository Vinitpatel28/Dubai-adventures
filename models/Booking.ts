import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  activityId: { type: String, required: true },
  activityTitle: { type: String, required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  adults: { type: Number, required: true },
  children: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  promoCode: { type: String, default: null },
  discountAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'pending', enum: ['pending', 'paid', 'failed', 'refunded'] },
  paymentMethod: { type: String, default: null },
  transactionId: { type: String, default: null },
  status: { type: String, default: 'pending' },
  isAdminRead: { type: Boolean, default: false },
  comboItems: [{
    activityId: String,
    date: Date,
    timeSlot: String
  }],
  selectedTransportIndex: { type: Number, default: null },
  pickupLocation: { type: String, default: null },
  dropoffLocation: { type: String, default: null },
  specialRequirements: { type: String, default: "" },
  isPackageBooking: { type: Boolean, default: false },
  packageStartDate: { type: Date, default: null },
  packageEndDate: { type: Date, default: null },
  durationDays: { type: Number, default: 0 },
  durationNights: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
