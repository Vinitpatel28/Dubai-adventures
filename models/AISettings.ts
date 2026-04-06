import mongoose from 'mongoose';

const AISettingsSchema = new mongoose.Schema({
  isEnabled: { type: Boolean, default: true },
  personality: { 
    type: String, 
    default: 'You are an expert luxury travel consultant for "Dubai Adventures". Your goal is to help users plan their dream Dubai experiences in a friendly, helpful, and sophisticated manner.' 
  },
  greetingMessage: { 
    type: String, 
    default: 'Salaam! I\'m your Dubai Expert. I can help you find the best desert safaris, luxury yachts, or thrills across the Emirates. What are you looking for today?' 
  },
  modelName: { type: String, default: 'gemini-flash-latest' }
}, { timestamps: true });

export default mongoose.models.AISettings || mongoose.model('AISettings', AISettingsSchema);
