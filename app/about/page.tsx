import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Compass, ShieldCheck, Heart, Award, Globe, Zap, Users, Star } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import About from "@/models/About";
import Category from "@/models/Category";
import Image from "next/image";

const ICON_MAP: Record<string, any> = {
  Globe, ShieldCheck, Heart, Award, Compass, Star, Users, Zap
};

export const revalidate = 300; // Cache for 5 minutes

async function getPageData() {
  await dbConnect();
  const [aboutData, categoriesData] = await Promise.all([
    About.findOne().lean(),
    Category.find().sort({ order: 1 }).lean()
  ]);
  
  return {
    about: aboutData ? JSON.parse(JSON.stringify(aboutData)) : null,
    categories: categoriesData ? JSON.parse(JSON.stringify(categoriesData)) : []
  };
}

export default async function AboutPage() {
  const { about: data, categories } = await getPageData();

  if (!data) return null;

  const hero = data?.hero || {};
  const heritage = data?.heritage || {};
  const stats = data?.stats || [];
  const values = data?.values || [];
  const fleet = data?.fleet || {};

  return (
    <main className="min-h-screen bg-[var(--s0)] text-[var(--t1)] selection:bg-[#D4962A]/30">
      <Navbar
        hasBooking={false}
        categories={categories}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden border-b border-[var(--bw1)] theme-force-dark">
        <div className="absolute inset-0 z-0 border-b border-[var(--bw1)]">
          <Image
            src={hero.image || "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2000"}
            fill
            className="object-cover opacity-100 scale-105"
            alt="Dubai Skyline"
          />
        </div>

        <div className="relative z-10 text-center space-y-6 px-5 max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="gold-line w-12" />
            <span className="text-[0.7rem] tracking-[0.4em] uppercase font-bold text-[#D4962A]">Premium Experience</span>
            <div className="gold-line w-12" />
          </div>
          <h1 className="fd text-5xl md:text-7xl font-light tracking-tight leading-[1.1] text-white">
            {hero.title || 'Redefining Arabian Luxury Adventures'}
          </h1>
          <p className="text-xl text-[var(--t2)] max-w-2xl mx-auto leading-relaxed font-medium">
            {hero.subtitle}
          </p>
        </div>
      </section>

      {/* Our Heritage */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <div className="space-y-4">
                <h2 className="fd text-4xl font-light">{heritage.title || 'A Legacy of Passion'}</h2>
                <div className="w-20 h-0.5 bg-[#D4962A]" />
              </div>

              <div className="space-y-6 text-[var(--t2)] leading-[1.8] text-[0.95rem]">
                <p className="whitespace-pre-line">{heritage.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6">
                {stats.map((s: any, i: number) => {
                  const Icon = ICON_MAP[s.iconName] || Star;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#D4962A]/10 flex items-center justify-center text-[#D4962A]">
                          <Icon size={14} />
                        </div>
                        <span className="fd text-2xl font-bold text-[var(--t1)]">{s.value}</span>
                      </div>
                      <p className="text-[0.6rem] uppercase tracking-widest font-black text-[var(--t3)]">{s.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-[var(--bw2)] shadow-2xl relative z-10">
                <Image
                  src={heritage.image || "https://images.unsplash.com/photo-1544949589-9e8c47f7d983?q=80&w=1200"}
                  fill
                  className="object-cover"
                  alt="Heritage"
                />
              </div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#D4962A]/10 rounded-full blur-[100px] -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-[var(--s1)] border-y border-[var(--bw1)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16 space-y-4">
            <span className="text-[0.65rem] tracking-[0.4em] uppercase font-bold text-[#D4962A]">Why We Exist</span>
            <h2 className="fd text-4xl font-light">Mission & <span className="gold-text">Philosophy</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v: any, i: number) => {
              const Icon = ICON_MAP[v.iconName] || Globe;
              return (
                <div key={i} className="p-10 rounded-[2.5rem] bg-[var(--s2)]/40 border border-[var(--bw2)] hover:border-[#D4962A]/30 transition-all duration-500 group text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#D4962A]/10 flex items-center justify-center mx-auto text-[#D4962A] group-hover:bg-[#D4962A] group-hover:text-black transition-all duration-500">
                    <Icon size={24} />
                  </div>
                  <h4 className="fd text-xl font-medium tracking-wide">{v.title}</h4>
                  <p className="text-sm text-[var(--t2)] leading-relaxed font-light">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fleet section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-[2rem] h-64 w-full overflow-hidden bg-[var(--s1)] border border-[var(--bw2)] shadow-2xl relative">
                  <Image src={fleet.gallery?.[0] || 'https://images.unsplash.com/photo-1563212879-d5992987a075?q=80&w=800'}
                    fill
                    className="object-cover"
                    alt="Fleet 1"
                  />
                </div>
                <div className="rounded-[2rem] h-48 w-full overflow-hidden bg-[var(--s1)] border border-[var(--bw2)] shadow-2xl relative">
                  <Image src={fleet.gallery?.[1] || 'https://images.unsplash.com/photo-1489447068241-b3490214e879?q=80&w=1200'}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-110"
                    alt="Fleet 2"
                  />
                </div>
              </div>
              <div className="pt-12 space-y-4">
                <div className="rounded-[2rem] h-48 w-full overflow-hidden bg-[var(--s1)] border border-[var(--bw2)] shadow-2xl relative">
                  <Image src={fleet.gallery?.[2] || 'https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=1200'}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-110"
                    alt="Fleet 3"
                  />
                </div>
                <div className="rounded-[2rem] h-64 w-full overflow-hidden bg-[var(--s1)] border border-[var(--bw2)] shadow-2xl relative">
                  <Image src={fleet.gallery?.[3] || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200'}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-110"
                    alt="Fleet 4"
                  />
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 space-y-8">
              <span className="text-[0.65rem] tracking-[0.4em] uppercase font-bold text-[#D4962A]">Expert Logistics</span>
              <h3 className="fd text-4xl font-light leading-tight">{fleet.title || 'Elite Fleet, Unmatched Standards'}</h3>
              <p className="text-[var(--t2)] leading-relaxed text-[0.95rem]">
                {fleet.description}
              </p>

              <ul className="space-y-4">
                {(fleet.points || []).map((point: string, i: number) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-bold tracking-widest uppercase text-[var(--t2)]">
                    <div className="text-[#D4962A]"><Zap size={14} /></div>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#D4962A]">
        <div className="max-w-4xl mx-auto px-5 text-center space-y-8">
          <h2 className="fd text-4xl md:text-5xl text-black font-semibold">Ready to start your <br /> next Arabian tale?</h2>
          <a
            href="/#experiences"
            className="inline-block px-10 py-4 bg-black text-[#D4962A] rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform"
          >
            Explore Experiences
          </a>
        </div>
      </section>

      <Footer categories={categories} />
    </main>
  );
}
