import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import About from '@/models/About';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    let about = await About.findOne().lean();
    if (!about) {
      about = await About.create({
        stats: [
          { label: "Years in UAE", value: "15+" },
          { label: "Tours Conducted", value: "100k+" },
          { label: "Customer Rating", value: "4.9/5" },
          { label: "Professional Guides", value: "85+" }
        ],
        values: [
          { title: "Authentic Experiences", desc: "We don't just show you Dubai; we immerse you in its soul.", iconName: "Globe" },
          { title: "Safety & Excellence", desc: "Your safety is our sanctuary.", iconName: "ShieldCheck" },
          { title: "Sustainable Journey", desc: "We are committed to preserving the Arabian heritage.", iconName: "Heart" }
        ],
        fleet: {
          points: [
            "In-house Logistics & Operations",
            "Multi-lingual Platinum Certified Guides",
            "24/7 Dedicated Concierge Support",
            "Bespoke Itinerary Planning"
          ],
          gallery: [
            "https://images.unsplash.com/photo-1563212879-d5992987a075?q=80&w=800",
            "https://images.unsplash.com/photo-1489447068241-b3490214e879?q=80&w=800",
            "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=800",
            "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800"
          ]
        }
      });
    }
    const resObj = about.toObject ? about.toObject() : about;
    const cleanAbout = deepClean(resObj);
    return NextResponse.json({ about: cleanAbout });
  } catch (err: any) {
    console.error("About GET Error:", err);
    return NextResponse.json({ message: 'Error fetching about data' }, { status: 500 });
  }
}

const deepClean = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(deepClean);
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    const skipKeys = ['_id', '__v', 'createdAt', 'updatedAt', 'id'];
    for (const key in obj) {
      if (!skipKeys.includes(key)) {
        newObj[key] = deepClean(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const cleanData = deepClean(body);
    
    console.log("Saving Cleaned About Data:", JSON.stringify(cleanData, null, 2));

    // replaceOne ensures the entire document is replaced by the cleanData object,
    // which is the most reliable way to force the DB to match the Admin state.
    await About.replaceOne({}, cleanData, { upsert: true });
    
    // Fetch fresh from DB to return to client
    const updated = await About.findOne().lean();
    const finalized = deepClean(updated);

    return NextResponse.json({ about: finalized });
  } catch (err: any) {
    console.error("About Update Error:", err);
    return NextResponse.json({ 
      message: 'Server failed to save changes', 
      error: err.message
    }, { status: 500 });
  }
}
