import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Sub-types for Package Modules ──────────────────────────────────────
export interface IPackageUpgrade {
  id: string;
  title: string;
  priceDelta: number;
  image?: string;
}

export interface IPackageModule {
  id: string;
  type: 'hotel' | 'flight' | 'transfer' | 'activity' | 'meal' | 'leisure';
  title: string;
  description: string;
  image?: string;
  time?: string;
  duration?: string;
  baseCost: number;
  isIncluded: boolean;
  isRemovable: boolean;
  metadata?: Record<string, string>;
  upgrades?: IPackageUpgrade[];
}

export interface IPackageDay {
  dayNumber: number;
  title: string;
  description?: string;
  modules: IPackageModule[];
}

export interface IActivity extends Document {
  title: string;
  subtitle: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  childPrice?: number;
  originalPrice?: number;
  isComboDeal?: boolean;
  duration: string;
  rating: number;
  reviewCount: number;
  image: string; // Cloudinary URL
  category: string;
  badge?: string;
  badgeType?: 'gold' | 'luxury' | 'popular' | 'new' | 'recommended' | 'bestseller';
  highlights: string[];
  included: string[];
  timeSlots: string[];
  maxGroupSize: number;
  isActive: boolean;
  videoUrl?: string;
  gallery: string[];
  createdAt: Date;
  updatedAt: Date;
  notIncluded: string[];
  meetingAndPickup: string;
  agePolicy: string[];
  driverRequirement: string;
  safetyRestrictions: string[];
  languages: string[];
  location: string;
  cancellationPolicy: string;
  isPublished: boolean;
  difficultyLevel?: string;
  bestTime?: string;
  whatToBring?: string[];
  transportOptions?: { label: string; price: number; isPerPerson: boolean; vehicleIcon?: string }[];
  pricingRules?: { label: string; type: 'date' | 'weekend'; date?: string; adjustment: number }[];
  itinerary?: { time: string; activity: string; description: string; icon: string }[];
  localizations?: Record<string, { title?: string; subtitle?: string; shortDescription?: string; fullDescription?: string; highlights?: string[] }>;
  
  // ── Hybrid Package Fields ──
  isPackage?: boolean;
  durationDays?: number;
  durationNights?: number;
  packageItinerary?: IPackageDay[];
}

// ── Package Schemas ──
const UpgradeSchema = new Schema({
  id:         { type: String, required: true },
  title:      { type: String, required: true },
  priceDelta: { type: Number, required: true },
  image:      { type: String, default: '' },
}, { _id: false });

const ModuleSchema = new Schema({
  id:          { type: String, required: true },
  type:        { type: String, enum: ['hotel', 'flight', 'transfer', 'activity', 'meal', 'leisure'], required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  time:        { type: String, default: '' },
  duration:    { type: String, default: '' },
  baseCost:    { type: Number, default: 0 },
  isIncluded:  { type: Boolean, default: true },
  isRemovable: { type: Boolean, default: false },
  metadata:    { type: Map, of: String, default: {} },
  upgrades:    { type: [UpgradeSchema], default: [] },
}, { _id: false });

const PackageDaySchema = new Schema({
  dayNumber:   { type: Number, required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  modules:     { type: [ModuleSchema], default: [] },
}, { _id: false });

const ActivitySchema = new Schema<IActivity>(
  {
    title:            { type: String, required: true, trim: true },
    subtitle:         { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true },
    fullDescription:  { type: String, required: true },
    price:            { type: Number, required: true, min: 0 },
    childPrice:       { type: Number, min: 0 },
    originalPrice:    { type: Number, min: 0 },
    isComboDeal:      { type: Boolean, default: false },
    duration:         { type: String, required: true },
    rating:           { type: Number, required: true, min: 0, max: 5, default: 4.5 },
    reviewCount:      { type: Number, required: true, min: 0, default: 0 },
    image:            { type: String, required: true }, // Cloudinary URL
    category:         { type: String, required: true },
    badge:            { type: String, default: '' },
    badgeType:        { type: String, enum: ['gold', 'luxury', 'popular', 'new', 'recommended', 'bestseller'], default: 'popular' },
    highlights:       { type: [String], default: [] },
    included:         { type: [String], default: [] },
    timeSlots:        { type: [String], default: [] },
    maxGroupSize:     { type: Number, required: true, min: 1, default: 10 },
    isActive:         { type: Boolean, default: true },
    videoUrl:         { type: String, default: '' },
    gallery:          { type: [String], default: [] },
    notIncluded:      { type: [String], default: [] },
    meetingAndPickup: { type: String, default: '' },
    agePolicy:        { type: [String], default: [] },
    driverRequirement:{ type: String, default: '' },
    safetyRestrictions:{ type: [String], default: [] },
    languages:        { type: [String], default: [] },
    location:         { type: String, default: '' },
    cancellationPolicy:{ type: String, default: '' },
    isPublished:      { type: Boolean, default: true },
    difficultyLevel:  { type: String, default: '' },
    bestTime:         { type: String, default: '' },
    whatToBring:      { type: [String], default: [] },
    transportOptions: { type: [{
      label: String,
      price: Number,
      isPerPerson: { type: Boolean, default: true },
      vehicleIcon: { type: String, default: 'Car' }
    }], default: [] },
    pricingRules: { type: [{
      label: String,
      type: { type: String, enum: ['date', 'weekend'] },
      date: String,
      adjustment: Number
    }], default: [] },
    itinerary: { type: [{
      time: String,
      activity: String,
      description: String,
      icon: String
    }], default: [] },
    localizations: { type: Map, of: {
      title: String,
      subtitle: String,
      shortDescription: String,
      fullDescription: String,
      highlights: [String]
    }, default: {} },
    
    // ── Hybrid Package Fields ──
    isPackage:        { type: Boolean, default: false },
    durationDays:     { type: Number, min: 1, default: 1 },
    durationNights:   { type: Number, min: 0, default: 0 },
    packageItinerary: { type: [PackageDaySchema], default: [] },
  },
  { timestamps: true }
);

// Prevent model recompilation in Next.js hot-reload
const ActivityModel: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default ActivityModel;
