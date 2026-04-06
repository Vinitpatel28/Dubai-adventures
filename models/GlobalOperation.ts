import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPricingRule extends Document {
  label: string;
  type: 'date' | 'weekend' | 'fixed_holiday';
  date?: string; // ISO date or MM-DD for fixed holidays
  adjustment: number; // Value to add to the base price
  adjustmentType: 'fixed' | 'percentage';
  applyToAll: boolean;
  targetActivityIds: string[]; // Activity IDs this applies to if !applyToAll
  isActive: boolean;
}

export interface IBlackoutDate extends Document {
  label: string;
  date: string; // ISO date
  reason?: string;
  applyToAll: boolean;
  targetActivityIds: string[];
  isActive: boolean;
}

export interface IGlobalOperation extends Document {
  pricingRules: IPricingRule[];
  blackoutDates: IBlackoutDate[];
  updatedBy?: string;
}

const PricingRuleSchema = new Schema({
  label: { type: String, required: true },
  type: { type: String, enum: ['date', 'weekend', 'fixed_holiday'], required: true },
  date: String,
  adjustment: { type: Number, required: true },
  adjustmentType: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
  applyToAll: { type: Boolean, default: true },
  targetActivityIds: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
});

const BlackoutDateSchema = new Schema({
  label: { type: String, default: 'Blackout' },
  date: { type: String, required: true },
  reason: String,
  applyToAll: { type: Boolean, default: true },
  targetActivityIds: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
});

const GlobalOperationSchema = new Schema(
  {
    pricingRules: [PricingRuleSchema],
    blackoutDates: [BlackoutDateSchema],
    updatedBy: String,
  },
  { timestamps: true }
);

const GlobalOperation: Model<IGlobalOperation> =
  mongoose.models.GlobalOperation || mongoose.model<IGlobalOperation>('GlobalOperation', GlobalOperationSchema);

export default GlobalOperation;
