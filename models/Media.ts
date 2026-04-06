import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true }, // Cloudinary public_id
  fileName: { type: String },
  format: { type: String },
  size: { type: Number },
  width: { type: Number },
  height: { type: Number },
  usageCount: { type: Number, default: 0 }, // How many activities use this?
}, { timestamps: true });

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
