"use client";

import ExperienceDetail from "./ExperienceDetail";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Activity } from "../types";

interface Props {
  activity: Activity;
  categories: any[];
}

export default function ExperienceClient({ activity, categories }: Props) {
  return (
    <>
      <Navbar 
        hasBooking={false} 
        categories={categories} 
        onCartClick={() => {}} 
        forceDark={false} 
      />
      <ExperienceDetail activity={activity} />
      <Footer categories={categories} />
    </>
  );
}
