export interface Activity {
  id: string;
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
  reviewCount?: number;
  image: string;
  category: "desert" | "atv" | "luxury" | "sky" | "water" | "cruises" | "theme-parks" | "fishing" | "helicopter" | "scuba" | "combo" | "signature-journeys";
  isPackage?: boolean;
  badge?: string;
  badgeType?: "gold" | "luxury" | "popular" | "new" | "recommended" | "bestseller";
  highlights: string[];
  included: string[];
  timeSlots: string[];
  maxGroupSize: number;
  isActive?: boolean;
  videoUrl?: string;
  gallery?: string[];
  notIncluded?: string[];
  meetingAndPickup?: string;
  agePolicy?: string[];
  driverRequirement?: string;
  safetyRestrictions?: string[];
  languages?: string[];
  location?: string;
  cancellationPolicy?: string;
  isPublished?: boolean;
  difficultyLevel?: string;
  bestTime?: string;
  whatToBring?: string[];
  transportOptions?: { label: string; price: number; isPerPerson: boolean; vehicleIcon?: string }[];
  pricingRules?: { label: string; type: 'date' | 'weekend'; date?: string; adjustment: number }[];
  itinerary?: { time: string; activity: string; description: string; icon: string }[];
  localizations?: Record<string, { title?: string; subtitle?: string; shortDescription?: string; fullDescription?: string; highlights?: string[] }>;
}

export interface BookingState {
  activity: Activity | null;
  date: Date | null;
  timeSlot: string;
  adults: number;
  children: number;
  fullName: string;
  email: string;
  phone: string;
  promoCode?: {
    code: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minBookingValue?: number;
    minGuests?: number;
    appliesTo?: string;
    categories?: string[];
    activities?: string[];
  } | null;
  comboItems?: {
    activityId: string;
    date: Date | null;
    timeSlot: string;
  }[];
  selectedTransportIndex?: number;
  transportIndex?: number;
  pickupLocation?: string;
  dropoffLocation?: string;
  specialRequirements?: string;
  paymentMethod?: 'card' | 'wallet';
  transactionId?: string;
  // Package-specific booking state
  packageStartDate?: Date | null;
  packageEndDate?: Date | null;
  packageDates?: Date[];
}

export interface BookingConfirmation {
  bookingId: string;
  activity: Activity;
  date: Date;
  timeSlot: string;
  adults: number;
  children: number;
  totalPrice: number;
  fullName: string;
  email: string;
  phone: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  specialRequirements?: string;
  selectedTransportIndex?: number;
}
