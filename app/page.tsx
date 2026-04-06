import React, { Suspense } from "react";
import dbConnect from "@/lib/mongodb";
import ActivityModel from "@/models/Activity";
import CategoryModel from "@/models/Category";
import HomeClient from "./HomeClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dubai Adventures | Premium Desert & Sea Experiences",
  description: "Experience the ultimate luxury adventures in Dubai. From high-speed red dune ATV rides to serene private yacht cruises and iconic hot air balloon safaris.",
  openGraph: {
    title: "Dubai Adventures | Premium Desert & Sea Experiences",
    description: "Book the best of Dubai's luxury adventures. Desert safaris, yacht charters, and theme parks with premium service.",
    images: ["/images/hero_bg_4k_1772860004560.png"],
  },
};

async function getInitialData() {
  await dbConnect();
  
  const [activitiesDocs, categoriesDocs] = await Promise.all([
    ActivityModel.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
    CategoryModel.find({}).sort({ order: 1 }).lean()
  ]);

  // Normalize _id → id for Serializing
  const activities = activitiesDocs.map((doc: any) => ({
    ...JSON.parse(JSON.stringify(doc)),
    id: doc._id.toString(),
  }));

  const categories = JSON.parse(JSON.stringify(categoriesDocs));

  // Preferred order sorting (reusing API logic)
  const PREFERRED_ORDER = [
    "The Ultimate Dubai Discovery Trio",
    "Dubai Sky & Sea VIP Excellence",
    "Dubai Ultimate Adrenaline Bundle",
    "Dubai Mega Theme Park Duo",
    "Dubai City Tour",
    "IMG Worlds of Adventure",
    "Luxury Yacht Charter",
    "Dubai Desert Safari with Dune Bashing, Camel Ride & BBQ",
    "Morning Buggy Dunes Safari with Sandboarding",
    "Dubai Red Dunes ATV, Camels, Stargazing & BBQ",
    "Sandboarding Desert Experience",
    "Dubai Balloon Ride with Breakfast & Falconry Show",
    "Deluxe Desert Safari with BBQ Dinner",
    "Dubai Morning Desert Safari with Quad Biking",
    "Luxury Superyacht Cruise with Live DJ & Swimming"
  ];

  activities.sort((a: any, b: any) => {
    const idxA = PREFERRED_ORDER.indexOf(a.title);
    const idxB = PREFERRED_ORDER.indexOf(b.title);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  return { activities, categories };
}

export default async function Home() {
  const { activities, categories } = await getInitialData();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050403] flex items-center justify-center font-bold uppercase tracking-widest text-[#D4962A]/40 animate-pulse">
        Initializing Adventure...
      </div>
    }>
      <HomeClient 
        initialActivities={activities} 
        initialCategories={categories} 
      />
    </Suspense>
  );
}
