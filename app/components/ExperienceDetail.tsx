"use client";

import { useState } from "react";
import { Activity } from "../types";
import { Check, Clock, Users, Star, X, MapPin, Shield, Zap, Sparkles, ChevronLeft, ChevronRight, Car, Waves, Home, Utensils, Camera, Cloud, Coffee, List, Loader2, Lock } from "lucide-react";
import ReviewsSection from "./ReviewsSection";
import { useCurrency } from "../context/CurrencyContext";
import { useLanguage } from "../context/LanguageContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

interface Props {
  activity: Activity;
  isSelected?: boolean;
}

export default function ExperienceDetail({ activity, isSelected = false }: Props) {
  const { convert } = useCurrency();
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const router = useRouter();

  const totalPhotos = [...(activity.gallery || []), activity.image];
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const openLightbox = (idx: number) => {
    setGalleryIndex(idx);
    setLightboxPhoto(totalPhotos[idx]);
  };

  const closeLightbox = () => setLightboxPhoto(null);

  const nextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIdx = (galleryIndex + 1) % totalPhotos.length;
    setGalleryIndex(newIdx);
    setLightboxPhoto(totalPhotos[newIdx]);
  };

  const prevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIdx = (galleryIndex - 1 + totalPhotos.length) % totalPhotos.length;
    setGalleryIndex(newIdx);
    setLightboxPhoto(totalPhotos[newIdx]);
  };

  return (
    <div className="min-h-screen bg-[var(--s0)] text-[var(--t1)] pb-24 relative overflow-x-hidden">
      {/* 🖼️ High-Fidelity Hero Media */}
      <div className="relative w-full h-[60vh] lg:h-[80vh] overflow-hidden bg-black">
        <Image
          src={activity.image}
          alt={activity.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-20">
        <div className="p-8 sm:p-14 lg:p-16 relative z-10 rounded-3xl bg-[var(--s0)] shadow-[0_-20px_60px_rgba(0,0,0,0.1)] -mt-20">

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.3em] font-black text-[var(--g300)] hover:brightness-125 transition-all"
            >
              <ChevronLeft size={16} />
              {t('ui.back_to_experiences')}
            </button>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[var(--bw1)] to-transparent" />
          </div>

          {/* Luxury Header Section */}
          <div className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {activity.isComboDeal && (
                <span className="px-3 py-1.5 rounded-lg bg-[var(--g300)] text-black text-[0.6rem] font-black uppercase tracking-[0.2em]">
                  {t('ui.premium_multi_experience')}
                </span>
              )}
              <span className="px-3 py-1.5 text-[0.6rem] uppercase font-bold tracking-[0.2em] rounded-lg border border-[var(--g300)]/30 text-[var(--g300)]">
                {activity.subtitle}
              </span>
            </div>
            <div className="flex items-center gap-3">
                  <h1 className="fd text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-[1.05] text-[var(--t1)]">
                    {activity.title}
                  </h1>
                </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Chronicles & Description */}
            <div className="lg:col-span-8 space-y-12">

              {/* 📸 Visual Chronicles - Balanced & Compact Size */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24 relative z-0">
                {/* Primary Feature Image */}
                <div
                  onClick={() => openLightbox(0)}
                  className="md:col-span-8 h-[300px] md:h-[450px] rounded-2xl overflow-hidden group cursor-zoom-in relative shadow-lg"
                >
                  <Image
                    src={totalPhotos[0] || activity.image}
                    fill
                    className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                    alt="Primary Chronicle"
                  />
                </div>

                {/* Secondary Stack */}
                <div className="md:col-span-4 grid grid-cols-1 gap-8 md:h-[450px]">
                  <div
                    onClick={() => openLightbox(1)}
                    className="h-[200px] md:h-full rounded-2xl overflow-hidden group cursor-zoom-in relative shadow-md"
                  >
                    <Image
                      src={totalPhotos[1] || activity.image}
                      fill
                      className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                      alt="Secondary Chronicle"
                    />
                  </div>
                  <div
                    onClick={() => openLightbox(2)}
                    className="h-[200px] md:h-full rounded-2xl overflow-hidden group cursor-zoom-in relative shadow-md"
                  >
                    <Image
                      src={totalPhotos[2] || activity.image}
                      fill
                      className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                      alt="Tertiary Chronicle"
                    />
                  </div>
                </div>
              </div>

              {/* Narratives Section (Balanced Layout) */}
              <div className="space-y-12 block relative pt-6 mb-20 border-t border-[var(--bw1)]/20">
                <p className="text-2xl sm:text-3xl leading-[1.3] font-light text-[var(--t1)] italic opacity-95">
                  "{activity.shortDescription}"
                </p>
                <div className="h-px w-24 bg-gradient-to-r from-[var(--g300)]/40 to-transparent" />
                <p className="text-[1.12rem] leading-[1.9] text-[var(--t2)] font-light whitespace-pre-line tracking-wide">
                  {activity.fullDescription}
                </p>
              </div>

              {/* 🕒 Immersive Timeline */}
              {activity.itinerary && activity.itinerary.length > 0 && (
                <div className="p-8 sm:p-10 rounded-3xl bg-[var(--s1)] border border-[var(--bw1)] space-y-10 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[0.65rem] tracking-[0.25em] uppercase font-black text-[var(--g300)] mb-1.5">Expert Itinerary</p>
                      <h3 className="fd text-2xl font-medium text-[var(--t1)] italic">Experience Timeline</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[var(--g300)]/10 flex items-center justify-center text-[var(--g300)]">
                      <Clock size={20} />
                    </div>
                  </div>

                  <div className="relative space-y-10 pl-8">
                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-[var(--g300)]/40 via-[var(--g300)]/20 to-transparent" />
                    {activity.itinerary.map((item, idx) => (
                      <div key={idx} className="relative group/item">
                        <div className="absolute -left-8 top-1.5 w-[23px] h-[23px] rounded-full bg-[var(--s1)] border-2 border-[var(--g300)]/40 flex items-center justify-center z-10 group-hover/item:border-[var(--g300)] transition-colors">
                          <div className="w-2 h-2 rounded-full bg-[var(--g300)]" />
                        </div>
                        <div>
                          <p className="text-[0.6rem] font-black text-[var(--g300)] uppercase tracking-widest mb-1">{item.time}</p>
                          <h4 className="text-lg font-medium text-[var(--t1)] mb-2">{item.activity}</h4>
                          <p className="text-sm text-[var(--t2)] leading-relaxed font-light">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Statistics & Booking (Standard Sidebar) */}
            <div className="lg:col-span-4 space-y-8">
              <div className="p-8 rounded-3xl bg-[var(--s1)] border border-[var(--bw1)] space-y-8 shadow-xl">
                <div>
                  <p className="text-[0.65rem] tracking-[0.25em] font-black text-[var(--g300)] uppercase mb-2">Exclusive Reservation</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-medium text-[var(--t1)] fd">{convert(activity.price)}</span>
                    {activity.originalPrice && (
                      <span className="text-sm text-[var(--t2)]/40 line-through">{convert(activity.originalPrice)}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-[var(--bw1)]">
                  {[
                    { icon: Clock, label: t('ui.duration'), value: activity.duration },
                    { icon: Users, label: t('ui.max_guests'), value: activity.maxGroupSize },
                    { icon: Shield, label: t('ui.cancellation'), value: t('ui.flexible') }
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-3 text-[var(--t2)]/60 text-xs">
                        <stat.icon size={14} className="text-[var(--g300)]" />
                        <span className="font-bold uppercase tracking-widest leading-none">{stat.label}</span>
                      </div>
                      <span className="text-sm text-[var(--t1)] font-medium">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {authLoading ? (
                  <div className="w-full py-5 rounded-2xl bg-[var(--bw1)] flex items-center justify-center">
                    <Loader2 size={20} className="animate-spin text-[var(--g300)]" />
                  </div>
                ) : user ? (
                  <Link
                    href={`/book/${activity.id}`}
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#D4962A] to-[#B67E22] text-black text-[0.65rem] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(212,150,42,0.2)] hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center"
                  >
                    {t('ui.reserve_package')}
                  </Link>
                ) : (
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("openAuthModal"))}
                    className="w-full py-5 rounded-2xl bg-[var(--bw1)] border border-[var(--bw2)] text-[var(--t2)] text-[0.65rem] font-black uppercase tracking-[0.2em] hover:bg-[var(--bw2)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Lock size={14} className="text-[var(--g300)]" />
                    {t('ui.login_to_reserve') || "Login to Reserve"}
                  </button>
                )}
              </div>

              {/* Quick Highlights Selection */}
              <div className="p-8 rounded-3xl bg-[var(--s1)] border border-[var(--bw1)] space-y-6">
                <h4 className="fd text-xl italic text-[var(--t1)]">{t('ui.experience_highlights')}</h4>
                <div className="space-y-4">
                  {activity.highlights.slice(0, 5).map((h, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[var(--g300)] shrink-0" />
                      <p className="text-[0.85rem] text-[var(--t2)] font-light leading-snug">{h}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Logistics Bento Grid - Essential Information */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 border-t border-[var(--bw1)]">
            <div className="p-8 rounded-3xl bg-[var(--s1)] border border-[var(--bw1)] shadow-sm">
              <p className="text-[0.65rem] font-black uppercase tracking-widest text-[var(--g300)] mb-4">{t('ui.inclusions')}</p>
              <div className="space-y-3">
                {activity.included?.slice(0, 6).map((inc) => (
                  <div key={inc} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center mt-0.5 shrink-0">
                      <Check size={12} className="text-emerald-500" />
                    </div>
                    <span className="text-[0.8rem] text-[var(--t2)] font-light">{inc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[var(--s1)] border border-[var(--bw1)] shadow-sm">
              <p className="text-[0.65rem] font-black uppercase tracking-widest text-[var(--g300)] mb-4">{t('ui.good_to_know')}</p>
              <div className="space-y-4">
                {activity.agePolicy && activity.agePolicy.length > 0 && (
                  <div>
                    <span className="text-[0.6rem] font-black uppercase text-[var(--t2)]/40 block mb-1">{t('ui.age_policy')}</span>
                    <p className="text-[0.75rem] text-[var(--t2)]">{activity.agePolicy.join(", ")}</p>
                  </div>
                )}
                {activity.languages && activity.languages.length > 0 && (
                  <div>
                    <span className="text-[0.6rem] font-black uppercase text-[var(--t2)]/40 block mb-1">{t('ui.languages')}</span>
                    <p className="text-[0.75rem] text-[var(--t2)]">{activity.languages.join(" • ")}</p>
                  </div>
                )}
                <div className="pt-2">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--s0)] border border-[var(--bw1)] font-medium text-[var(--g300)]">
                    <Shield size={14} />
                    <span className="text-[0.7rem] uppercase tracking-wider">{t('ui.luxury_guaranteed')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[var(--s1)] border border-[var(--bw1)] shadow-sm">
              <p className="text-[0.65rem] font-black uppercase tracking-widest text-[var(--g300)] mb-4">{t('ui.policies_safety')}</p>
              <div className="space-y-4">
                <div>
                  <span className="text-[0.6rem] font-black uppercase text-[var(--t2)]/40 block mb-1">{t('ui.cancellation')}</span>
                  <p className="text-[0.75rem] text-[var(--t2)]">{activity.cancellationPolicy || "Free cancellation up to 24h before."}</p>
                </div>
                {activity.safetyRestrictions && activity.safetyRestrictions.length > 0 && (
                  <div>
                    <span className="text-[0.6rem] font-black uppercase text-[var(--t2)]/40 block mb-1">{t('ui.safety_warnings')}</span>
                    <ul className="space-y-1">
                      {activity.safetyRestrictions.slice(0, 3).map((item) => (
                        <li key={item} className="text-[0.7rem] text-red-500/80 font-light">• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-16 pt-16 border-t border-[var(--bw1)]">
            <ReviewsSection activityId={activity.id} activityTitle={activity.title} />
          </div>
        </div>
      </div>

      {/* 🖼️ Premium Full-Screen Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300 theme-force-dark"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-8 right-8 w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all z-[1100]"
            onClick={closeLightbox}
          >
            <X size={24} />
          </button>

          <div className="relative max-w-6xl w-full h-full flex items-center justify-center group" onClick={(e) => e.stopPropagation()}>
            <Image
              src={lightboxPhoto}
              alt="Gallery Full View"
              fill
              className="object-contain rounded-2xl shadow-2xl"
            />
            {/* Nav Arrows */}
            <button
              onClick={prevLightbox}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all sm:flex"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={nextLightbox}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-all sm:flex"
            >
              <ChevronRight size={32} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
