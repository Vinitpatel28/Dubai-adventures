import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  activityId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  authorName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true },
  comment: { type: String, required: true },
  verified: { type: Boolean, default: false }, // verified purchase
  helpfulCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
