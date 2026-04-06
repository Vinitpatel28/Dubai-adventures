'use client';

import { Cookie, Settings, Eye, HelpCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";

export default function CookiesPage() {
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none blur-3xl opacity-30" />
        <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-2xl">
              <Cookie size={32} />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl fd font-bold tracking-tight" style={{ color: "var(--t1)" }}>Cookie Policy</h1>
          <p className="text-[0.75rem] uppercase tracking-[0.4em] text-emerald-400 font-black">Digital Navigation Preferences</p>
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto mt-8" />
          <p className="text-xs mt-4" style={{ color: "var(--t3)" }}>Policy Version: March 2026</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-16">
          
          <div className="space-y-6">
            <h2 className="text-2xl fd font-bold flex items-center gap-3" style={{ color: "var(--t1)" }}>
              <HelpCircle className="text-emerald-500/60" size={24} />
              What are Cookies?
            </h2>
            <p className="leading-relaxed text-[0.9rem]" style={{ color: "var(--t2)" }}>
              Cookies are small text files that are stored on your computer or mobile device when you visit our luxury travel platform. They help us remember your preferences and provide you with a more personalized experience.
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl fd font-bold flex items-center gap-3" style={{ color: "var(--t1)" }}>
              <Settings className="text-emerald-500/60" size={24} />
              Categories of Cookies We Use
            </h2>
            <div className="space-y-8">
              {[
                { title: "Essential Cookies", desc: "These are necessary for the website to function correctly, enabling secure desert safari bookings and account access.", color: "bg-emerald-500" },
                { title: "Performance & Analytics", desc: "Allows us to count visits and traffic sources so we can measure and improve the performance of our curated experiences.", color: "bg-emerald-500/60" },
                { title: "Marketing & Preferences", desc: "Used to track visitors across websites to display ads that are relevant and engaging for individual users.", color: "bg-emerald-500/30" }
              ].map((item, i) => (
                <div key={i} className="group p-8 rounded-3xl border transition-all hover:bg-emerald-500/5" style={{ backgroundColor: "var(--s1)", borderColor: "var(--bw1)" }}>
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: "var(--t1)" }}>{item.title}</h3>
                  </div>
                  <p className="text-xs leading-loose ml-7 mt-4" style={{ color: "var(--t2)" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl fd font-bold flex items-center gap-3" style={{ color: "var(--t1)" }}>
              <Eye className="text-emerald-500/60" size={24} />
              Managing Your Digital Data
            </h2>
            <p className="leading-relaxed text-[0.9rem]" style={{ color: "var(--t2)" }}>
              You can change your cookie preferences through your browser settings. Most browsers allow you to block cookies or delete them from your browsing history. Please note that blocking some cookies may affect your experience on our website.
            </p>
          </div>

          <div className="pt-10 border-t flex justify-center" style={{ borderColor: "var(--bw1)" }}>
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-[0.7rem] uppercase tracking-widest font-black transition-colors"
              style={{ color: "var(--t3)" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "#10B981"}
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
