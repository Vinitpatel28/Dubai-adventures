import mongoose from 'mongoose';

// Version: 1.0.3 - Absolute Schema Re-Evaluation
const PromoCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: { type: String, default: '' },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 100 },
  usageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  minBookingValue: { type: Number, default: 0 },
  minGuests: { type: Number, default: 0 },
  appliesTo: { type: String, enum: ['all', 'category', 'specific'], default: 'all' },
  activities: { type: [String], default: [] }, // Array of activity IDs
  categories: { type: [String], default: [] }, // Array of category slugs
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

// Avoid schema mismatch issues by clearing model cache in development
if (mongoose.models && mongoose.models.PromoCode) {
    delete mongoose.models.PromoCode;
}

const PromoCodeModel = mongoose.model('PromoCode', PromoCodeSchema);
export default PromoCodeModel;
