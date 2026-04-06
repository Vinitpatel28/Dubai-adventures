require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  category: String,
  price: Number,
  duration: String,
  rating: Number,
  reviewCount: Number,
  image: String,
  shortDescription: String,
  fullDescription: String,
  highlights: [String],
  included: [String],
  timeSlots: [String],
  maxGroupSize: Number,
  isActive: Boolean,
  isPublished: Boolean
});

const Activity = mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);

const newActivities = [
  {
    title: "Dubai City Tour",
    subtitle: "Half Day Sightseeing Tour",
    category: "luxury",
    price: 150,
    duration: "4 Hours",
    rating: 4.8,
    reviewCount: 1705,
    image: "/images/city-tour.png",
    shortDescription: "Explore Burj Khalifa, Dubai Mall, and Palm Jumeirah with expert guides.",
    fullDescription: "Discover Dubai’s iconic modern sights and historic neighborhoods in a few hours. Marvel at Zabeel Palace’s grandeur, admire the sail-shaped Burj Al Arab, and stroll the quaint streets of the Al Bastakiya Quarter.",
    highlights: [
      "Photo stops at Zabeel Palace, Dubai Frame, Burj Al Arab",
      "Visit to Bastakiya and Old Houses",
      "Abra ride along Dubai Creek",
      "Explore Gold Souk and Spice Souk"
    ],
    included: [
      "Hotel Pickup and Drop-off",
      "Licensed English Speaking Guide",
      "Abra Boat Ride Ticket",
      "Bottled Water"
    ],
    timeSlots: ["09:00 AM", "02:00 PM"],
    maxGroupSize: 15,
    isActive: true,
    isPublished: true
  },
  {
    title: "IMG Worlds of Adventure",
    subtitle: "World's Largest Indoor Theme Park",
    category: "theme-parks",
    price: 345,
    duration: "Full Day",
    rating: 4.7,
    reviewCount: 850,
    image: "/images/img-worlds.png",
    shortDescription: "Experience over 20 rides and attractions across 4 epic zones.",
    fullDescription: "IMG Worlds of Adventure is Dubai’s first mega themed entertainment destination. Split into 4 epic zones (Marvel, Cartoon Network, Lost Valley, and IMG Boulevard), it offers a temperature-controlled environment for year-round fun.",
    highlights: [
      "Marvel zone with Avengers-themed rides",
      "Cartoon Network zone for kids and families",
      "Lost Valley Dinosaur Adventure zone",
      "State-of-the-art 5D cinema experience"
    ],
    included: [
      "General Admission Ticket",
      "Unlimited access to all rides",
      "Access to all 4 zones",
      "Free Parking"
    ],
    timeSlots: ["10:00 AM", "12:00 PM"],
    maxGroupSize: 100,
    isActive: true,
    isPublished: true
  },
  {
    title: "Luxury Yacht Charter",
    subtitle: "Private Marine Experience",
    category: "water",
    price: 450,
    duration: "2-4 Hours",
    rating: 4.9,
    reviewCount: 120,
    image: "/images/yacht.png",
    shortDescription: "Cruising along Dubai Marina, JBR, and around Palm Jumeirah.",
    fullDescription: "Experience the ultimate luxury with a private yacht charter. Perfect for celebrations or a relaxed day out on the water, seeing Dubai's skyline from a unique perspective.",
    highlights: [
      "Breathtaking views of Bluewaters Island",
      "Photo ops near Atlantis The Palm",
      "Onboard music system and BBQ facilities",
      "Professional crew and captain"
    ],
    included: [
      "Soft Drinks and Water",
      "Ice and Disposable Cups",
      "Fishing Equipment (on request)",
      "Safety Gear"
    ],
    timeSlots: ["10:00 AM", "02:00 PM", "05:00 PM"],
    maxGroupSize: 12,
    isActive: true,
    isPublished: true
  },
  {
    title: "Deep Sea Fishing",
    subtitle: "Adventure on the Arabian Gulf",
    category: "fishing",
    price: 2500,
    duration: "4 Hours",
    rating: 4.9,
    reviewCount: 174,
    image: "/images/fishing.png",
    shortDescription: "Private 4-hour fishing trip with professional gear.",
    fullDescription: "Embark on an exciting deep sea fishing adventure. Our professional crew will guide you to the best fishing spots where you can catch Kingfish, Cobia, Sultan Ibrahim, and more.",
    highlights: [
      "Equipped with modern fish-finding sonar",
      "Expert crew to assist beginners",
      "Spectacular offshore views of the city",
      "High-performance fishing gear included"
    ],
    included: [
      "Professional Fishing Rods and Baits",
      "Soft Drinks and Refreshments",
      "Captain and Crew assistance",
      "Full Insurance"
    ],
    timeSlots: ["06:00 AM", "02:00 PM"],
    maxGroupSize: 6,
    isActive: true,
    isPublished: true
  },
  {
    title: "Helicopter Tour Dubai",
    subtitle: "Aerial Sightseeing Adventure",
    category: "helicopter",
    price: 675,
    duration: "12-25 Minutes",
    rating: 5.0,
    reviewCount: 95,
    image: "/images/helicopter.png",
    shortDescription: "Birds-eye view of Dubai's landmarks.",
    fullDescription: "Take to the skies for a thrilling helicopter tour. Fly over the world-famous Palm Jumeirah, Burj Al Arab, and the World Islands with a spectacular view of the Burj Khalifa.",
    highlights: [
      "Unmatched aerial views of Palm Jumeirah",
      "Close fly-by of Burj Al Arab",
      "View the World Islands from above",
      "Professional pilot commentary"
    ],
    included: [
      "Helicopter Flight Experience",
      "Live Pilot Narrative",
      "Pre-flight Safety Briefing",
      "Refreshing Juice on arrival"
    ],
    timeSlots: ["11:00 AM", "01:00 PM", "03:00 PM"],
    maxGroupSize: 5,
    isActive: true,
    isPublished: true
  },
  {
    title: "Scuba Diving Experience",
    subtitle: "Discover Underwater Dubai",
    category: "scuba",
    price: 390,
    duration: "2 Hours",
    rating: 4.8,
    reviewCount: 65,
    image: "/images/scuba.png",
    shortDescription: "Discover scuba diving for beginners and Pros.",
    fullDescription: "Dive into the clear waters of Dubai. Whether you are a first-timer or an experienced diver, enjoy the vibrant marine life and coral reefs under the guidance of PADI instructors.",
    highlights: [
      "Professional PADI certified instructors",
      "Dive at Jumeirah Beach dive spots",
      "Introduction to scuba equipment",
      "Underwater photo and video service"
    ],
    included: [
      "Full Scuba Diving Gear",
      "Educational Briefing",
      "Underwater Photos",
      "Snacks and Water"
    ],
    timeSlots: ["09:00 AM", "01:00 PM"],
    maxGroupSize: 4,
    isActive: true,
    isPublished: true
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI is not defined');

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    for (const act of newActivities) {
      // Upsert by title
      await Activity.findOneAndUpdate(
        { title: act.title },
        act,
        { upsert: true, new: true }
      );
      console.log(`Synced: ${act.title}`);
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
