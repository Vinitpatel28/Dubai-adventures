import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wishlist: [{ type: String }],
  cart: { type: Array, default: [] },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
