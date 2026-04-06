import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable');
  process.exit(1);
}

// Reuse the schemas if possible, but defining here for script independence
const ActivitySchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  shortDescription: String,
  fullDescription: String,
  price: Number,
  childPrice: Number,
  originalPrice: Number,
  isComboDeal: Boolean,
  duration: String,
  rating: { type: Number, default: 4.8 },
  reviewCount: { type: Number, default: 0 },
  image: String,
  category: String,
  badge: String,
  badgeType: String,
  highlights: [String],
  included: [String],
  timeSlots: [String],
  maxGroupSize: Number,
  isActive: { type: Boolean, default: true },
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
  isPublished: { type: Boolean, default: true },
  difficultyLevel: String,
  bestTime: String,
  whatToBring: [String],
  transportOptions: [{
    label: String,
    price: Number,
    isPerPerson: { type: Boolean, default: true }
  }],
  itinerary: [{
    time: String,
    activity: String,
    description: String,
    icon: String
  }],
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const NEW_CATEGORIES = [
  { name: "Theme Parks", slug: "theme-parks", description: "World-class theme parks and indoor attractions", icon: "Gamepad2", order: 5 },
  { name: "Water Sports", slug: "water", description: "Yacht cruises, fishing, and diving adventures", icon: "Waves", order: 6 },
  { name: "Sky Adventure", slug: "sky", description: "Helicopter tours and aerial views", icon: "Plane", order: 7 }
];

const NEW_ACTIVITIES = [
  {
    title: "IMG Worlds of Adventure",
    subtitle: "World's Largest Indoor Theme Park",
    shortDescription: "Experience over 20 rides and attractions across 4 epic zones in a temperature-controlled environment.",
    fullDescription: "IMG Worlds of Adventure is the ultimate destination for year-round fun. Spanning 1.5 million square feet, this mega-themed entertainment destination features four epic adventure zones: Marvel, Cartoon Network, Lost Valley - Dinosaur Adventure, and IMG Boulevard. From meeting your favorite Marvel superheroes to encountering life-sized animatronic dinosaurs, the park offers pulse-pounding action for the whole family.",
    price: 365,
    childPrice: 0,
    originalPrice: 450,
    isComboDeal: false,
    duration: "6 Hours",
    rating: 4.8,
    reviewCount: 1250,
    image: "https://images.unsplash.com/photo-1513889959040-6a3f9433a73b?q=80&w=1000",
    category: "theme-parks",
    badge: "Family Favorite",
    badgeType: "recommended",
    highlights: [
      "The Velociraptor: High-speed roller coaster",
      "Marvel Zone: Spider-Man, Hulk, and Iron Man rides",
      "Lost Valley: Immersive dinosaur world",
      "The Haunted Hotel: Spooky walk-through adventure",
      "Cartoon Network: Powerpuff Girls & Ben 10 fun"
    ],
    included: [
      "Standard Entry Ticket",
      "Access to all 4 Adventure Zones",
      "Unlimited rides and attractions",
      "Free Parking for guests"
    ],
    timeSlots: ["12:00 PM", "01:00 PM", "02:00 PM"],
    maxGroupSize: 500,
    isActive: true,
    gallery: [
      "https://images.unsplash.com/photo-1502675135487-e971002a6adb?q=80&w=1000",
      "https://images.unsplash.com/photo-1545239351-ef35f43d514b?q=80&w=1000"
    ],
    notIncluded: ["Food and beverages", "Fast Track pass", "Locker rentals"],
    meetingAndPickup: "IMG Worlds of Adventure, E311 Sheikh Mohammed Bin Zayed Rd, City of Arabia, Dubai.",
    agePolicy: ["Children under 105cm enter for free", "Adults 12+ years", "Seniors 60+ discount available"],
    safetyRestrictions: ["Height restrictions apply to specific rides", "Not recommended for guests with heart conditions"],
    languages: ["English", "Arabic", "Hindi"],
    location: "City of Arabia, Dubai",
    cancellationPolicy: "Non-refundable once booked.",
    difficultyLevel: "Easy",
    bestTime: "Year-Round (Air Conditioned)",
    whatToBring: ["Comfortable Walking Shoes", "ID Proof", "Camera"],
    itinerary: [
      { time: "12:00 PM", activity: "Entrance", description: "Check-in at the main gate and collect park map.", icon: "door-open" },
      { time: "01:30 PM", activity: "Marvel Zone", description: "Experience the high-adrenaline Avengers rides.", icon: "zap" },
      { time: "03:30 PM", activity: "Lost Valley", description: "Explore the dinosaur adventure rides.", icon: "egg" },
      { time: "06:00 PM", activity: "Haunted Hotel", description: "Dare to enter the scary live-experience hotel.", icon: "ghost" }
    ]
  },
  {
    title: "Luxury Yacht Charter - Dubai Marina",
    subtitle: "Private 48ft Premium Yacht Experience",
    shortDescription: "Cruising along Dubai Marina, JBR, and the iconic Burj Al Arab with a professional crew.",
    fullDescription: "Step aboard our meticulously maintained 48ft luxury yacht and set sail into the cerulean waters of the Arabian Gulf. This private experience is perfect for romantic sunset cruises, family celebrations, or simply escaping the city's hustle. Our professional crew will ensure you visit the most scenic spots, including the Palm Jumeirah and the magnificent Atlantis Hotel, while you relax in the climate-controlled cabin or lounge on the sun-drenched deck.",
    price: 850,
    childPrice: null,
    originalPrice: 1200,
    isComboDeal: false,
    duration: "2-4 Hours",
    rating: 4.9,
    reviewCount: 450,
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1000",
    category: "water",
    badge: "Luxury",
    badgeType: "luxury",
    highlights: [
      "Stunning views of the Dubai Marina skyline",
      "Sail past Burj Al Arab and Atlantis Palm",
      "Onboard music system with Bluetooth connect",
      "Swimming stops in Blue Water Island (for 3hr+ bookings)",
      "BBQ area available on board"
    ],
    included: [
      "Licensed Captain & Professional Crew",
      "Chilled Water & Soft Drinks",
      "Safety equipment and life jackets",
      "Fuel for the entire trip",
      "Disposable cups, plates, and cutlery"
    ],
    timeSlots: ["10:00 AM", "02:00 PM", "05:00 PM", "07:00 PM"],
    maxGroupSize: 15,
    isActive: true,
    gallery: [
      "https://images.unsplash.com/photo-1563299796-17596ed6b017?q=80&w=1000",
      "https://images.unsplash.com/photo-1567891777981-edc1aa9ca562?q=80&w=1000"
    ],
    notIncluded: ["Gourmet BBQ food (can be arranged)", "Alcoholic drinks", "Hotel Transfers"],
    meetingAndPickup: "Dubai Marina Yacht Club, Pier 7 entrance.",
    agePolicy: ["Infants (0-3) must be accompanied by parents", "All ages welcome"],
    safetyRestrictions: ["Guests must wear life jackets if suggested by captain"],
    languages: ["English", "Arabic", "Russian"],
    location: "Dubai Marina",
    cancellationPolicy: "Full refund 72 hours prior to start time.",
    difficultyLevel: "Relaxing",
    bestTime: "Sunset (4 PM - 7 PM)",
    whatToBring: ["Swimwear", "Sunscreen", "Camera", "Valid ID / Passport"],
    itinerary: [
      { time: "Start", activity: "Marina Sightseeing", description: "Sail through the Marina canal skyscrapers.", icon: "ship" },
      { time: "Mid", activity: "Palm Jumeirah", description: "Cruising around the Atlantis and Palm coastline.", icon: "camera" },
      { time: "End", activity: "Sunset Viewing", description: "Anchor near Burj Al Arab for photos.", icon: "sunset" }
    ]
  },
  {
    title: "Deep Sea Fishing Adventure",
    subtitle: "Professional Trolling & Casting Trip",
    shortDescription: "A thrilling offshore excursion into the Gulf to catch Barracuda, Kingfish, and Queenfish.",
    fullDescription: "Cast your line into the deep waters of the Arabian Gulf on our fully equipped fishing boat. Guided by local experts who know the best seasonal spots, you'll learn professional trolling and bottom fishing techniques. Whether you are a beginner or a seasoned angler, the thrill of the strike and the beautiful offshore skyline of Dubai make this an unforgettable experience. All professional gear, bait, and refreshments are provided.",
    price: 550,
    childPrice: 400,
    originalPrice: 750,
    isComboDeal: false,
    duration: "4 Hours",
    rating: 4.7,
    reviewCount: 320,
    image: "https://images.unsplash.com/photo-1506702315536-dd8b83e2dcf9?q=80&w=1000",
    category: "water",
    badge: "Popular",
    badgeType: "popular",
    highlights: [
      "Guided by champion local anglers",
      "Catch seasonal Kingfish, Barracuda, and Tuna",
      "Fully equipped boat with sonar fish finders",
      "Opportunity to keep your catch",
      "Spectacular view of the World Islands"
    ],
    included: [
      "Professional Fishing Rods & Reels",
      "Fresh Bait (Squid / Sardines)",
      "Soft Drinks & Mineral Water",
      "Full Insurance coverage",
      "Safety Gear"
    ],
    timeSlots: ["06:00 AM", "02:00 PM"],
    maxGroupSize: 8,
    isActive: true,
    gallery: [
      "https://images.unsplash.com/photo-1510284568019-2169bba2e9fe?q=80&w=1000"
    ],
    notIncluded: ["Catering/BBQ service", "Transfer to the marina"],
    meetingAndPickup: "Dubai Marina, South Zone.",
    agePolicy: ["Recommended for ages 5+", "Children under 16 must be with adult"],
    safetyRestrictions: ["Not recommended for people prone to severe sea sickness"],
    languages: ["English", "Arabic"],
    location: "Offshore Dubai",
    cancellationPolicy: "24h notification for full refund.",
    difficultyLevel: "Medium",
    bestTime: "Early Morning (6 AM - 10 AM)",
    whatToBring: ["Hat", "Polarized Sunglasses", "Sunscreen", "Passport Copy"],
    itinerary: [
      { time: "06:00 AM", activity: "Departure", description: "Leave the marina for the deep waters.", icon: "ship" },
      { time: "07:00 AM", activity: "Fishing Action", description: "Trolling for big game fish.", icon: "anchor" },
      { time: "09:30 AM", activity: "Casting & Jigging", description: "Bottom fishing for smaller species.", icon: "plus" }
    ]
  },
  {
    title: "Dubai Helicopter Tour (12 Min)",
    subtitle: "The Pearl Heli-Ride",
    shortDescription: "A breathtaking aerial tour over Burj Al Arab, Palm Jumeirah, and the World Islands.",
    fullDescription: "Experience the ultimate birds-eye view of Dubai's architectural wonders. Taking off from the Atlantis Helipad, your pilot will guide you over the world-famous Palm Jumeirah, the iconic sail-shaped Burj Al Arab, and the spectacular World Islands. Glide past the Burj Khalifa and the city's futuristic skyline in a state-of-the-art helicopter, capturing photos that are simply impossible from the ground.",
    price: 710,
    childPrice: null,
    originalPrice: 850,
    isComboDeal: false,
    duration: "12 Minutes",
    rating: 5.0,
    reviewCount: 920,
    image: "https://images.unsplash.com/photo-1464010149033-909774640d23?q=80&w=1000",
    category: "sky",
    badge: "World Class",
    badgeType: "gold",
    highlights: [
      "Aerial view of Palm Jumeirah & Atlantis",
      "Close fly-by of Burj Al Arab",
      "Fly over The World Islands",
      "Stunning panorama of Burj Khalifa skyline",
      "In-flight pilot commentary"
    ],
    included: [
      "12-minute helicopter flight",
      "Passenger insurance",
      "Inflight safety briefing",
      "Refreshing juice at lounge"
    ],
    timeSlots: ["10:30 AM", "12:30 PM", "02:30 PM", "04:30 PM"],
    maxGroupSize: 6,
    isActive: true,
    gallery: [
      "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?q=80&w=1000"
    ],
    notIncluded: ["Hotel Pickup & Drop", "Photography service"],
    meetingAndPickup: "Helidubai, Atlantis The Palm / Al Sufouh.",
    agePolicy: ["Children must be 2+ years old", "Weight restrictions apply"],
    safetyRestrictions: ["No big bags allowed", "Passport required for check-in"],
    languages: ["English", "Arabic", "French"],
    location: "Palm Jumeirah / Helidubai",
    cancellationPolicy: "48h before for full refund.",
    difficultyLevel: "Thrilling",
    bestTime: "Noon for clearest views",
    whatToBring: ["Original Passport / Emirates ID", "Smartphone for photos", "Light clothing"],
    itinerary: [
      { time: "Check-in", activity: "Lounge Arrival", description: "Passport verification and weight check.", icon: "check" },
      { time: "Briefing", activity: "Safety Protocol", description: "Briefing on aircraft safety.", icon: "info" },
      { time: "Flight", activity: "The Pearl Ride", description: "12-minute sightseeing of major landmarks.", icon: "zap" }
    ]
  },
  {
    title: "Scuba Diving at Jumeirah Beach",
    subtitle: "Discover Scuba (No License Required)",
    shortDescription: "Explore the vibrant underwater world of the Arabian Gulf with PADI certified instructors.",
    fullDescription: "Dive into adventure with our 'Discover Scuba Diving' program, designed specifically for beginners. You don't need a license to experience the thrill of breathing underwater. After a brief theory session and safety drills in shallow water, you'll head out for a guided dive at Jumeirah Beach. Encounter colorful reef fish, rays, and unique marine life while our team captures your underwater journey with pro photography.",
    price: 395,
    childPrice: null,
    originalPrice: 550,
    isComboDeal: false,
    duration: "3 Hours",
    rating: 4.8,
    reviewCount: 155,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1000",
    category: "water",
    badge: "New",
    badgeType: "new",
    highlights: [
      "PADI Instructor-led first dive",
      "Introduction to scuba equipment",
      "Guided underwater tour of Jumeirah reefs",
      "Underwater photography included",
      "Certification toward PADI Open Water"
    ],
    included: [
      "Full professional SCUBA gear rental",
      "Expert PADI instruction",
      "Underwater photos & videos",
      "Bottled water and juices",
      "Safety briefing"
    ],
    timeSlots: ["09:00 AM", "01:00 PM", "03:00 PM"],
    maxGroupSize: 4,
    isActive: true,
    gallery: [
      "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?q=80&w=1000"
    ],
    notIncluded: ["Wetsuit rental (available for AED 50)", "Lunch"],
    meetingAndPickup: "Jumeirah Beach Road, Public Beach access 4.",
    agePolicy: ["Minimum age 10 years", "Medical form completion required"],
    safetyRestrictions: ["Must not fly within 18 hours after diving", "Not for pregnant women"],
    languages: ["English", "Arabic", "German"],
    location: "Jumeirah Beach, Dubai",
    cancellationPolicy: "Free cancellation up to 24h before.",
    difficultyLevel: "Easy - Moderate",
    bestTime: "October - May",
    whatToBring: ["Swimwear", "Towel", "Change of clothes", "Passport Copy"],
    itinerary: [
      { time: "Start", activity: "Briefing", description: "Equipment fitting and dive theory.", icon: "book" },
      { time: "Mid", activity: "Water Skills", description: "Shallow water practice and drills.", icon: "waves" },
      { time: "End", activity: "Guided Dive", description: "Exploring the Jumeirah house reef.", icon: "camera" }
    ]
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI as string);
    console.log('Connected!');

    // 1. Ensure Categories exist
    console.log('Upserting categories...');
    for (const cat of NEW_CATEGORIES) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $set: cat },
        { upsert: true, new: true }
      );
      console.log(`- Category upserted: ${cat.name}`);
    }

    // 2. Insert Activities
    console.log('Inserting activities...');
    let insertedCount = 0;
    for (const actData of NEW_ACTIVITIES) {
      // Use findOneAndUpdate with upsert to avoid duplicates but update content
      const result = await Activity.findOneAndUpdate(
        { title: actData.title },
        { $set: actData },
        { upsert: true, new: true }
      );
      if (result) {
        insertedCount++;
        console.log(`- Activity seeded/updated: ${actData.title}`);
      }
    }

    console.log(`Successfully processed ${insertedCount} activities.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
