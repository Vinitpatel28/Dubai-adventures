import dbConnect from "@/lib/mongodb";
import ActivityModel from "@/models/Activity";
import mongoose from "mongoose";
import BookingClient from "../../components/BookingClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();
  const activity: any = await ActivityModel.findById(id).lean();
  if (!activity) return { title: "Book Experience | Dubai Adventures" };
  return {
    title: `Book ${activity.title} | Dubai Adventures`,
    description: `Book your spot for ${activity.title}. ${activity.shortDescription || ''}`.slice(0, 160),
    openGraph: {
      title: `Book ${activity.title} | Dubai Adventures`,
      description: activity.shortDescription || activity.fullDescription?.slice(0, 160),
      images: activity.image ? [activity.image] : [],
    },
  };
}
export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await dbConnect();

  // Fetch parallel data on the server
  const [activityDoc, allActivitiesDocs, categoriesDocs] = await Promise.all([
    ActivityModel.findById(id).lean(),
    ActivityModel.find({ isActive: true }).lean(),
    mongoose.model("Category").find({ isActive: true }).lean()
  ]);

  if (!activityDoc) {
    return notFound();
  }

  // Serialize helper
  const serialize = (data: any) => JSON.parse(JSON.stringify(data));

  const activity = {
    ...serialize(activityDoc),
    id: (activityDoc as any)._id.toString(),
    _id: (activityDoc as any)._id.toString(),
  };

  const allActivities = allActivitiesDocs.map((a: any) => ({
    ...serialize(a),
    id: a._id.toString(),
    _id: a._id.toString(),
  }));

  const categories = serialize(categoriesDocs);

  return (
    <BookingClient 
      activity={activity}
      allActivities={allActivities}
      categories={categories}
    />
  );
}
