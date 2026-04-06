'use client';

import { ShieldCheck, Eye, Lock, FileText, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";

export default function PrivacyPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(data => setCategories(data.categories || []));
  }, []);

  return (
    <main className="min-h-screen bg-[var(--s0)] transition-colors duration-300">
      <Navbar hasBooking={false} categories={categories} onCartClick={() => {}} forceDark={false} />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden border-b border-[var(--bw1)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#D4962A]/20 to-transparent pointer-events-none blur-3xl opacity-30" />
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#D4962A]/10 border border-[#D4962A]/20 flex items-center justify-center text-[#D4962A]">
              <ShieldCheck size={32} />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl fd font-bold tracking-tight" style={{ color: "var(--t1)" }}>Privacy Policy</h1>
          <p className="text-[0.75rem] uppercase tracking-[0.4em] text-[#D4962A] font-black">Protecting Your Digital Journey</p>
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#D4962A] to-transparent mx-auto mt-8" />
          <p className="text-xs mt-4" style={{ color: "var(--t3)" }}>Last Updated: March 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          
          <div className="space-y-6">
            <h2 className="text-2xl fd font-bold flex items-center gap-3" style={{ color: "var(--t1)" }}>
              <Eye className="text-[#D4962A]/60" size={24} />
              Introduction
            </h2>
            <p className="leading-relaxed text-[0.9rem]" style={{ color: "var(--t2)" }}>
              At Dubai Adventures, we respect your concerns about privacy. This Privacy Policy describes the types of personal information we collect about our customers, how we use the information, with whom we share it and the choices available to our customers regarding our use of the information.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl fd font-bold flex items-center gap-3" style={{ color: "var(--t1)" }}>
              <FileText className="text-[#D4962A]/60" size={24} />
              Information We Collect
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border transition-all" style={{ backgroundColor: "var(--s1)", borderColor: "var(--bw1)" }}>
                <h3 className="text-[#D4962A] text-sm font-bold uppercase tracking-widest">Personal Identification</h3>
                <p className="text-xs leading-loose mt-4" style={{ color: "var(--t2)" }}>
                  Name, email address, telephone number, and physical address provided during the booking process or newsletter signup.
                </p>
              </div>
              <div className="p-6 rounded-2xl border transition-all" style={{ backgroundColor: "var(--s1)", borderColor: "var(--bw1)" }}>
                <h3 className="text-[#D4962A] text-sm font-bold uppercase tracking-widest">Activity Data</h3>
                <p className="text-xs leading-loose mt-4" style={{ color: "var(--t2)" }}>
                  Booking history, preferences for specific desert experiences, and interaction with our digital itineraries.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl fd font-bold flex items-center gap-3" style={{ color: "var(--t1)" }}>
              <Lock className="text-[#D4962A]/60" size={24} />
              How We Use Information
            </h2>
            <ul className="space-y-4">
              {[
                "To process and confirm your luxury desert experience bookings.",
                "To communicate with you about our services and special promotions.",
                "To personalize your experience and provide tailored recommendations.",
                "To maintain the safety and security of our digital infrastructure."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4 text-[0.9rem]" style={{ color: "var(--t2)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4962A] mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-10 border-t flex justify-center" style={{ borderColor: "var(--bw1)" }}>
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-[0.7rem] uppercase tracking-widest font-black transition-colors"
              style={{ color: "var(--t3)" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#D4962A"}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--t3)"}
            >
              <ArrowLeft size={16} />
              Return to Dubai Adventures
            </button>
          </div>

        </div>
      </section>

      <Footer categories={categories} />
    </main>
  );
}
