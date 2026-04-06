import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Newsletter from "../components/Newsletter";
import { 
  Mail, Phone, MapPin, Clock, 
  MessageSquare, Globe, Heart, Shield,
  Send, CheckCircle, ChevronRight,
  Sparkles, Zap, MessageCircle, LucideIcon
} from "lucide-react";

import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Settings from "@/models/Settings";
import ContactForm from "./ContactForm";
import Image from "next/image";

const ICON_MAP: Record<string, LucideIcon> = { 
  Phone, MessageSquare, Mail, MapPin, Clock, Globe, Heart, Shield, Send, Sparkles, Zap, MessageCircle 
};

export const revalidate = 300; // Cache for 5 minutes

async function getPageData() {
  await dbConnect();
  const [categoriesData, settingsData] = await Promise.all([
    Category.find().sort({ order: 1 }).lean(),
    Settings.findOne().lean()
  ]);
  
  return {
    categories: categoriesData ? JSON.parse(JSON.stringify(categoriesData)) : [],
    settings: settingsData ? JSON.parse(JSON.stringify(settingsData)) : null
  };
}

export default async function ContactPage() {
  const { categories, settings } = await getPageData();

  const contactData = settings?.contactPage || {
    heroImage: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2000',
    title: 'Contact Dubai Adventures',
    subtitle: 'Whether you are planning a private luxury desert safari or need assistance with your booking, our 24/7 dedicated support team is here to assist you.',
    cards: [
      { title: 'Booking Helpline', icon: 'Phone', value: '+971 4 123 4567', desc: '24/7 Support for existing bookings', link: 'tel:+97141234567' },
      { title: 'WhatsApp Connect', icon: 'MessageCircle', value: '+971 50 987 6543', desc: 'Average response time: 2 minutes', link: 'https://wa.me/971509876543' },
      { title: 'Official Email', icon: 'Mail', value: 'hello@dubaiadventure.com', desc: 'Concierge & Group Enquiries', link: 'mailto:hello@dubaiadventure.com' },
      { title: 'Corporate HQ', icon: 'MapPin', value: 'Business Bay, Dubai', desc: 'Opus Tower, Suite 402', link: 'https://goo.gl/maps/xyz' }
    ],
    operatingHours: [
      { days: "Mon - Sat", hours: "09:00 AM - 10:00 PM" },
      { days: "Sunday", hours: "09:00 AM - 01:00 PM" },
      { days: "Digital Support", hours: "24 / 7 / 365" }
    ],
    safetyContent: {
      text: 'All our vehicles are RTA approved and drivers are DTCM certified. We maintain the highest safety standards in the UAE.',
      tags: ['Certified Drivers', 'Fully Insured', '24/7 Monitoring']
    },
    location: {
      address: 'Opus Tower, Dubai',
      mapLink: 'https://goo.gl/maps/xyz',
      image: 'https://images.unsplash.com/photo-1544949110-3882f054817a?q=80&w=1200'
    }
  };

  return (
    <main className="min-h-screen bg-[var(--s0)] text-[var(--t1)] selection:bg-[#D4962A]/30 font-light overflow-hidden">
      <Navbar 
        hasBooking={false} 
        categories={categories}
      />

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden border-b border-[var(--bw1)] theme-force-dark">
        <div className="absolute inset-0 z-0 border-b border-[var(--bw1)]">
          <Image 
            src={contactData.heroImage || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c'} 
            alt="Contact Hero" 
            fill
            className="object-cover opacity-100 scale-105 transition-all duration-700 hover:scale-100"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-fade-in mx-auto">
            <Sparkles size={12} className="text-[#D4962A]" />
            <span className="text-[0.63rem] tracking-[0.3em] uppercase font-bold text-white/50">Global Concierge</span>
          </div>
          
          <h1 className="fd text-5xl md:text-7xl font-light tracking-tight leading-[1.1] max-w-4xl mx-auto text-white">
            {contactData.title.split('Dubai Adventures')[0]}
            <span className="gold-text italic">Dubai Adventures</span>
          </h1>
          
          <p className="text-xl md:text-2xl font-light text-[var(--t2)] max-w-2xl mx-auto leading-relaxed h-28 overflow-hidden text-white/80">
            {contactData.subtitle}
          </p>
        </div>
      </section>

      {/* ── Contact Channels ── */}
      <section className="py-20 -mt-16 relative z-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(contactData.cards || []).map((card: any, idx: number) => {
              const Icon = ICON_MAP[card.icon] || Phone;
              return (
                <a 
                  key={idx} 
                  href={card.link}
                  target={card.link.startsWith('http') ? "_blank" : undefined}
                  className="p-8 rounded-[2rem] bg-[var(--s1)]/60 backdrop-blur-xl border border-[var(--bw2)] shadow-sm hover:border-[#D4962A]/40 hover:shadow-xl hover:shadow-[#D4962A]/5 transition-all duration-500 group block"
                  style={{ transitionDelay: `${idx * 50}ms` }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#D4962A]/10 flex items-center justify-center text-[#D4962A] group-hover:bg-[#D4962A] group-hover:text-black transition-all mb-6">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[var(--t3)] mb-2 truncate">
                    {card.title.toUpperCase() === 'NEW PROTOCOL' ? 'Support Channel' : card.title}
                  </h3>
                  <p className="text-lg font-semibold mb-1 truncate group-hover:text-[#D4962A] transition-colors">{card.value}</p>
                  <p className="text-[0.7rem] text-[var(--t2)] font-normal leading-relaxed">{card.desc}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Form & Info Detail ── */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

            {/* Left: Contact Form */}
            <div className="lg:col-span-7">
              <div className="p-8 sm:p-12 rounded-[3rem] bg-[var(--s1)]/40 border border-[var(--bw1)] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                  <Send size={200} />
                </div>

                <div className="mb-10">
                  <h2 className="fd text-3xl font-light mb-2">Send a <span className="gold-text">Message</span></h2>
                  <p className="text-[0.8rem] text-[var(--t3)] uppercase tracking-widest font-bold">Expect a response within 12 hours</p>
                </div>
                
                <ContactForm />
              </div>
            </div>

            {/* Right: Info Panels */}
            <div className="lg:col-span-5 space-y-8">

              {/* Operating Hours Cell */}
              <div className="p-8 rounded-[2.5rem] bg-[var(--s1)]/40 border border-[var(--bw1)] space-y-6">
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-[#D4962A]" />
                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-[var(--t1)]">Operating Schedule</span>
                </div>

                <div className="space-y-4">
                  {(contactData.operatingHours || []).map((item: any) => (
                    <div key={item.days} className="flex items-center justify-between py-2 border-b border-[var(--bw1)] last:border-0">
                      <span className="text-[0.7rem] font-medium text-[var(--t2)] tracking-wider uppercase">{item.days}</span>
                      <span className="text-[0.75rem] font-bold text-[var(--t1)] uppercase tracking-tight">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety Cell */}
              <div className="p-8 rounded-[2.5rem] bg-[#D4962A]/5 border border-[#D4962A]/10 space-y-6 overflow-hidden relative">
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-[#D4962A]" />
                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-[#D4962A]">Safety & Assurance</span>
                </div>
                <p className="text-[0.85rem] text-[var(--t2)] leading-relaxed font-light">
                  {contactData.safetyContent?.text}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {(contactData.safetyContent?.tags || []).map((tag: string) => (
                    <span key={tag} className="px-3 py-1.5 rounded-full bg-[#D4962A]/10 text-[0.55rem] font-black uppercase tracking-[0.2em] text-[#D4962A] border border-[#D4962A]/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <a 
                href={contactData.location?.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-video block rounded-[2.5rem] overflow-hidden border border-[var(--bw1)] relative group cursor-pointer shadow-2xl"
              >
                <Image
                  src={contactData.location?.image || 'https://images.unsplash.com/photo-1544949110-3882f054817a'}
                  fill
                  className="object-cover opacity-90 transition-all duration-700 group-hover:scale-110"
                  alt="Dubai Map"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-[#D4962A]/30 flex items-center justify-center text-[#D4962A] shadow-[0_0_30px_rgba(212,150,42,0.2)]">
                    <MapPin size={24} />
                  </div>
                  <span className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-white shadow-sm">{contactData.location?.address}</span>
                </div>
                <div className="absolute bottom-6 right-6 px-5 py-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-[0.6rem] font-black uppercase tracking-widest text-white hover:bg-[#D4962A] hover:text-black transition-all">
                  Open in Maps
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer categories={categories} />
    </main>
  );
}
