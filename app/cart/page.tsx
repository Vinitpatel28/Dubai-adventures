import Category from "@/models/Category";
import dbConnect from "@/lib/mongodb";
import CartClient from "./CartClient";

export const revalidate = 300; // Cache for 5 minutes

export default async function CartPage() {
  await dbConnect();
  
  const categories = await Category.find().sort({ order: 1 }).lean();

  return <CartClient categories={JSON.parse(JSON.stringify(categories))} />;
}
