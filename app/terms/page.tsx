'use client';

import { FileCheck, Book, AlertTriangle, Scale, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";

export default function TermsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(data => setCategories(data.categories || []));
  }, []);

  return (
    <main className="min-h-screen bg-[var(--s0)] transition-colors duration-300">
      <Navbar hasBooking={false} categories={categories} forceDark={false} />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden border-b border-[var(--bw1)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none blur-3xl opacity-30" />
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-2xl">
              <Scale size={32} />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl fd font-bold tracking-tight" style={{ color: "var(--t1)" }}>Terms of Service</h1>
          <p className="text-[0.75rem] uppercase tracking-[0.4em] text-blue-400 font-black">Luxury Engagement Framework</p>
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mt-8" />
          <p className="text-xs mt-4" style={{ color: "var(--t3)" }}>Effective Date: March 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          
          <div className="space-y-6">
            <h2 className="text-2xl fd font-bold flex items-center gap-3" style={{ color: "var(--t1)" }}>
              <Book className="text-blue-500/60" size={24} />
              1. Agreement to Terms
            </h2>
            <p className="leading-relaxed text-[0.9rem]" style={{ color: "var(--t2)" }}>
              By accessing our website and using our luxury services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service or participate in our experiences.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl fd font-bold flex items-center gap-3" style={{ color: "var(--t1)" }}>
              <FileCheck className="text-blue-500/60" size={24} />
              2. Booking Policy
            </h2>
            <div className="p-8 rounded-3xl border transition-all" style={{ backgroundColor: "var(--s1)", borderColor: "var(--bw1)" }}>
              <h3 className="text-blue-400 text-sm font-bold uppercase tracking-widest">Confirmation & Payment</h3>
              <p className="text-xs leading-loose mt-4" style={{ color: "var(--t2)" }}>
                Full payment is required to secure your premium desert expedition. All bookings are subject to availability and weather conditions within the Dubai desert ecosystem.
              </p>
              <h3 className="text-blue-400 text-sm font-bold uppercase tracking-widest mt-6">Child Policy</h3>
              <p className="text-xs leading-loose mt-4" style={{ color: "var(--t2)" }}>
                Children under the age of 3 are not recommended for dune bashing adventures. All minors must be accompanied by an adult.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl fd font-bold flex items-center gap-3" style={{ color: "var(--t1)" }}>
              <AlertTriangle className="text-blue-500/60" size={24} />
              3. Cancellation & Refunds
            </h2>
            <ul className="space-y-6">
              {[
                { label: "48 Hours Notice", desc: "Full refund provided for cancellations made more than 48 hours before scheduled experience." },
                { label: "Less than 24 Hours", desc: "No refund available for cancellations within 24 hours of the adventure start time." },
                { label: "Provider Cancellation", desc: "Full refund or alternative experience offered if weather conditions prevent activity." }
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold mb-2 uppercase tracking-wider" style={{ color: "var(--t1)" }}>{item.label}</h4>
                    <p className="text-[0.85rem]" style={{ color: "var(--t3)" }}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-10 border-t flex justify-center" style={{ borderColor: "var(--bw1)" }}>
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-[0.7rem] uppercase tracking-widest font-black transition-colors"
              style={{ color: "var(--t3)" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#3B82F6"}
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
