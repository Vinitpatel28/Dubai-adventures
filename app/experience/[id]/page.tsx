import dbConnect from "@/lib/mongodb";
import ActivityModel from "@/models/Activity";
import CategoryModel from "@/models/Category";
import mongoose from "mongoose";
import HybridPackageClient from "../../components/packages/HybridPackageClient";
import ExperienceClient from "../../components/ExperienceClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  await dbConnect();

  const activity: any = id.length === 24 
    ? await ActivityModel.findById(id).lean() 
    : await ActivityModel.findOne({ title: { $regex: new RegExp(id.replace(/-/g, ' '), 'i') } }).lean();

  if (!activity) return { title: "Adventure Not Found | Dubai Adventures" };

  return {
    title: `${activity.title} | Dubai Adventures`,
    description: activity.shortDescription || activity.fullDescription?.slice(0, 160) || "Experience the best of Dubai",
    openGraph: {
      images: activity.image ? [activity.image] : [],
    }
  };
}

export default async function ExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await dbConnect();

  // Fetch parallel data
  const [categoriesDocs, activityDoc] = await Promise.all([
    CategoryModel.find({ isActive: true }).lean(),
    id.length === 24 
      ? ActivityModel.findById(id).lean() 
      : ActivityModel.findOne({ title: { $regex: new RegExp(id.replace(/-/g, ' '), 'i') } }).lean()
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

  const categories = serialize(categoriesDocs);

  if (activity.isPackage) {
    return (
      <HybridPackageClient 
        activity={activity} 
        categories={categories} 
      />
    );
  }

  return (
    <ExperienceClient 
      activity={activity as any} 
      categories={categories} 
    />
  );
}
