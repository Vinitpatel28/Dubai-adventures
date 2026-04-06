import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

const ActivitySchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  shortDescription: String,
  fullDescription: String,
  price: Number,
  originalPrice: Number,
  isComboDeal: Boolean,
  duration: String,
  rating: Number,
  reviewCount: Number,
  image: String,
  category: String,
  badge: String,
  badgeType: String,
  highlights: [String],
  included: [String],
  timeSlots: [String],
  maxGroupSize: Number,
  isActive: Boolean,
  videoUrl: String,
  gallery: [String],
  notIncluded: [String],
  meetingAndPickup: String,
  agePolicy: [String],
  driverRequirement: String,
  safetyRestrictions: [String],
  languages: [String],
  location: String,
  cancellationPolicy: String,
  isPublished: Boolean,
  difficultyLevel: String,
  bestTime: String,
  whatToBring: [String],
}, { timestamps: true });

const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

const NEW_COMBOS = [
  {
    title: "Dubai Mega Theme Park Duo",
    subtitle: "IMG Worlds & Atlantis Aquaventure",
    category: "theme-parks",
    shortDescription: "3 activities, 3 days, 1 incredible price. The definitive way to see everything Dubai is famous for in one seamless package.",
    fullDescription: "Unlock the best of Dubai's entertainment for the whole family. The Mega-Pass gives you full-day access to two of the city's premier destinations. Spend day one inside the massive air-conditioned IMG Worlds of Adventure, meeting your favorite Marvel and Cartoon Network characters. On day two, cool off at Atlantis Aquaventure, the world's largest waterpark. With extra perks like Fast Track access and beach access, this is the heaviest-hitting family value in Dubai.",
    price: 649,
    originalPrice: 850,
    duration: "2 Separate Days",
    rating: 4.8,
    reviewCount: 3200,
    isComboDeal: true,
    isActive: true,
    isPublished: true,
    badge: "FAMILY CHOICE",
    badgeType: "recommended",
    highlights: ["Full Day Access to IMG Worlds of Adventure", "Entrance to Atlantis Aquaventure Waterpark", "Access to Aquaventure Private Beach", "Skip-the-line (Fast Track) on selected rides", "Valid for 14 days after first use"],
    included: ["All Entry Tickets", "Full Access to All Rides", "Safety Lockers at IMG", "Free Shuttle Service"],
    notIncluded: ["Meal vouchers (available as add-on)", "Towel rentals at Waterpark"],
    whatToBring: ["Swimwear for Waterpark", "Comfortable walking shoes", "Valid ID"],
    safetyRestrictions: ["Height restrictions apply (typically 1.1m or 1.2m)", "Not recommended for pregnant women"],
    agePolicy: ["Adult: 12+ years", "Child: 3-11 years (Below 1.2m)"],
    languages: ["English", "Arabic"],
    location: "Citywide (Shuttles available)",
    meetingAndPickup: "Self-arrival at parks. Free shuttles depart from major malls.",
    cancellationPolicy: "Full refund up to 24 hours before first activity.",
    difficultyLevel: "Easy",
    bestTime: "Year-Round",
    timeSlots: ["10:00 AM - Park Opening"],
    image: "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1000",
    gallery: [
      "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1000",
      "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1000",
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000"
    ]
  },
  {
    title: "Dubai City Tour & Burj Khalifa Heritage Trio",
    subtitle: "Modern Landmarks & Historic Culture",
    category: "cruises",
    shortDescription: "Discover Dubai's past and future. A guided city tour paired with the iconic Burj Khalifa and a traditional Abra ride.",
    fullDescription: "Experience the ultimate contrast of Dubai's history and its futuristic ambition. This combo takes you from the winding alleys of the Spice and Gold Souks to the 124th floor of the world's tallest building. Ride a traditional Abra across the Creek, explore the Al Fahidi heritage site, and finish with breathtaking 360-degree views from the Burj Khalifa observation deck. Perfectly curated for first-time visitors seeking the soul of the city.",
    price: 499,
    originalPrice: 650,
    duration: "6-8 Hours",
    rating: 4.9,
    reviewCount: 4500,
    isComboDeal: true,
    isActive: true,
    isPublished: true,
    badge: "MUST-DO",
    badgeType: "popular",
    highlights: ["Burj Khalifa Level 124 & 125 Entry", "Traditional Abra Boat Ride in Dubai Creek", "Walking Tour of Gold and Spice Souks", "Photo stops at Burj Al Arab & Atlantis", "Professional English Speaking Guide"],
    included: ["Burj Khalifa Entrance Tickets", "Air-conditioned transfers", "Traditional Abra Fee", "Bottled Water & Juice", "Hotel Pickup & Drop-off"],
    notIncluded: ["Personal shopping", "Burj Khalifa 'At The Top SKY' l148 upgrade"],
    whatToBring: ["Original Passport", "Camera", "Sun Protection"],
    safetyRestrictions: ["Easy walking required", "Wheelchair accessible throughout"],
    agePolicy: ["Adult: 12+ years", "Child: 4-11 years"],
    languages: ["English", "Arabic", "French", "German"],
    location: "Various Locations",
    meetingAndPickup: "Hotel pickup at 09:00 AM. Drop-off at Dubai Mall / Burj Khalifa.",
    cancellationPolicy: "24-hour notice for full refund.",
    difficultyLevel: "Easy",
    bestTime: "Morning or Afternoon",
    timeSlots: ["09:00 AM - Cultural Start", "02:00 PM - Sunset View"],
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000",
    gallery: [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000",
      "https://images.unsplash.com/photo-1582672097732-28a60c41fbd6?q=80&w=1000",
      "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1000"
    ]
  },
  {
    title: "Dubai Ultimate Adrenaline Bundle",
    subtitle: "Buggy Action, Sandboarding & Deep Sea Fishing",
    category: "adventure",
    shortDescription: "The ultimate 2-day action pass. Command high-powered dunes, glide down sand peaks, and reel in giants from the Arabian Gulf.",
    fullDescription: "Push your pulse into the red with our most intense adrenaline package. Day 1: Head into the deep desert for a 60-minute session behind the wheel of a high-powered Polaris or Can-Am dune buggy, followed by expert-led sandboarding on the steepest peaks. Day 2: Swap the sand for the sea on a 4-hour deep-sea fishing expedition from Dubai Marina. This is the only package in Dubai that conquers both the unforgiving desert and the vast ocean in one go.",
    price: 899,
    originalPrice: 1250,
    duration: "2 Separate Days",
    rating: 5.0,
    reviewCount: 890,
    isComboDeal: true,
    isActive: true,
    isPublished: true,
    badge: "EXTREME",
    badgeType: "popular",
    highlights: ["60-Min Self-Drive Dune Buggy (1000cc)", "High-speed Sandboarding on Red Dunes", "4-Hour Deep Sea Fishing with expert crew", "All professional gear and bait included", "Stunning GoPro footage possibilities"],
    included: ["1000cc Dune Buggy & Fuel", "Sandboarding Gear", "Deep Sea Fishing Gear & License", "Safety Helmets & Goggles", "Ice Cold Beverages"],
    notIncluded: ["Personal Insurance", "Gourmet meal (Lunch can be added)"],
    whatToBring: ["Action Camera", "Sturdy Shoes", "Sunscreen (SPF 50+)"],
    safetyRestrictions: ["Driver must be 16+", "Not suitable for those with back issues", "Zero alcohol policy"],
    agePolicy: ["Driver: 16+ years", "Passenger: 10+ years"],
    languages: ["English", "Arabic", "Urdu"],
    location: "Desert / Dubai Marina",
    meetingAndPickup: "Day 1: Desert Basecamp. Day 2: Dubai Marina Yacht Club.",
    cancellationPolicy: "48-hour notice for full refund.",
    difficultyLevel: "Moderate to Challenging",
    bestTime: "Early Morning",
    timeSlots: ["Day 1 Start: 08:00 AM", "Day 1 Start: 03:00 PM"],
    image: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1000",
    gallery: [
      "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?q=80&w=1000",
      "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1000",
      "https://images.unsplash.com/photo-1546768292-fb12f6c92568?q=80&w=1000"
    ]
  },
  {
    title: "Dubai Sky & Sea VIP Signature",
    subtitle: "Helicopter Flight & Luxury Yacht Charter",
    category: "luxury",
    shortDescription: "Experience Dubai from the highest and most elegant vantage points. 12 minutes of aerial wonder followed by 2 hours of private yachting.",
    fullDescription: "Reserved for those who settle for nothing but excellence. Begin your journey at the Police Academy Helipad for a 12-minute flight showcasing the Burj Al Arab, The World Islands, and the staggering Burj Khalifa. After landing, transition to a private 50ft luxury yacht in Dubai Marina. Explore the yacht's designer interiors, relax on the sun deck, and cruise past the stunning skyline while being served by a professional crew. This is the signature Dubai luxury experience.",
    price: 1549,
    originalPrice: 2100,
    duration: "4 Hours",
    rating: 5.0,
    reviewCount: 420,
    isComboDeal: true,
    isActive: true,
    isPublished: true,
    badge: "VIP CHOICE",
    badgeType: "luxury",
    highlights: ["12-Min Helicopter Flight (Iconic Route)", "2-Hour Private Yacht Charter (Up to 50ft)", "Access to Luxury Yacht Interior & Cabins", "Private door-to-door Chauffeur transfers", "Ice-cold refreshments & bottled water"],
    included: ["Private Helicopter Tour", "Private Yacht Rental", "Luxury Chauffeur (Pickup/Drop)", "Onboard Host/Crew", "Boutique Refreshments"],
    notIncluded: ["Catering/Food (can be added)", "Gratuities for crew"],
    whatToBring: ["Original Passport (Mandatory)", "Smart Casual Attire", "Sunglasses"],
    safetyRestrictions: ["Max weight 110kg per seat", "ID proof required for all guests"],
    agePolicy: ["Adult: 12+ years", "Child: 2+ years"],
    languages: ["English", "Arabic", "Russian"],
    location: "Helipad / Dubai Marina",
    meetingAndPickup: "Private pickup from hotel lobby 60 minutes before flight.",
    cancellationPolicy: "Strict 72-hour notice for rescheduling or refund.",
    difficultyLevel: "Easy",
    bestTime: "Sunset",
    timeSlots: ["10:00 AM - VIP Morning", "04:30 PM - Royal Sunset"],
    image: "https://images.unsplash.com/photo-1582672097732-28a60c41fbd6?q=80&w=1000",
    gallery: [
      "https://images.unsplash.com/photo-1582672097732-28a60c41fbd6?q=80&w=1000",
      "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?q=80&w=1000",
      "https://images.unsplash.com/photo-1546768292-fb12f6c92568?q=80&w=1000"
    ]
  },
  {
    title: "Dubai Red Dune Elite & Marina Yacht Dinner",
    subtitle: "High Dunes & Five-Star Floating Cuisine",
    category: "combo",
    shortDescription: "The city's most popular combination. A high-octane red dune safari followed by a romantic 5-star buffet dinner on a luxury yacht.",
    fullDescription: "Join Dubai's best-selling experience. Your adventure begins with a 4x4 pickup destined for the Lahbab Red Dunes, where you'll experience heart-pounding dune bashing and golden sandboarding. As the sun sets, head to Dubai Marina to board a magnificent luxury yacht. Indulge in an international 5-star buffet dinner, live music, and stunning views of the lighted Marina skyline, Ain Dubai, and Blue Waters. It's the perfect blend of desert thrill and marina chill.",
    price: 449,
    originalPrice: 620,
    duration: "8 Hours",
    rating: 4.8,
    reviewCount: 3200,
    isComboDeal: true,
    isActive: true,
    isPublished: true,
    badge: "BEST SELLER",
    badgeType: "bestseller",
    highlights: ["45-Min Red Dune Bashing in 4x4 Land Cruiser", "2-Hour Luxury Yacht Cruise with Dinner", "5-Star International Buffet & Live BBQ", "Sandboarding & Camel Ride Experience", "Belly Dance & Tanura Show at Desert Camp"],
    included: ["Hotel Pickup & Drop-off", "Professional Safari Guide", "Yacht Cruise & Dinner Entry", "Unlimited Soft Drinks & Water", "Photoshoots at Sunset"],
    notIncluded: ["Quad Biking (Optional add-on)", "Alcoholic beverages"],
    whatToBring: ["Camera", "Light jacket for winter", "Comfortable clothes"],
    safetyRestrictions: ["Not suitable for infants under 3", "Not recommended for guests with back problems"],
    agePolicy: ["Adult: 12+ years", "Child: 3-11 years"],
    languages: ["English", "Arabic", "Hindi"],
    location: "Desert / Dubai Marina",
    meetingAndPickup: "Hotel pickup at 02:45 PM. Return to hotel by 10:30 PM.",
    cancellationPolicy: "Free cancellation up to 24 hours in advance.",
    difficultyLevel: "Moderate (Safari)",
    bestTime: "Afternoon/Evening",
    timeSlots: ["02:30 PM - Elite Departure"],
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000",
    gallery: [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1000",
      "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?q=80&w=1000",
      "https://images.unsplash.com/photo-1546768292-fb12f6c92568?q=80&w=1000"
    ]
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected!');

    for (const combo of NEW_COMBOS) {
      console.log(`Checking if activity exists: ${combo.title}`);
      const exists = await Activity.findOne({ title: combo.title });
      if (exists) {
        console.log(`Activity already exists, updating: ${combo.title}`);
        await Activity.updateOne({ title: combo.title }, { $set: combo });
      } else {
        console.log(`Creating new activity: ${combo.title}`);
        await Activity.create(combo);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
