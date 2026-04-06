"use client";

import { useEffect, useRef, useState } from "react";
import { Activity } from "../types";
import clsx from "clsx";
import ActivityCard from "./ActivityCard";
import { Check, Zap, Clock, Users, Star, X, MapPin, AlertCircle, Info, Shield, Plus, FileText, Globe, Sparkles, ChevronLeft, ChevronRight, Ticket, Compass } from "lucide-react";
import ReviewsSection from "./ReviewsSection";
import { useCurrency } from "../context/CurrencyContext";
import { useLanguage } from "../context/LanguageContext";
import React from "react";

interface Props {
  activities: Activity[];
  categories: any[];
  expandedId: string | null;
  selectedId: string | null;
  wishlistItems: string[];
  initialCategory?: string;
  onExpand: (id: string | null) => void;
  onSelectPackage: (a: Activity) => void;
  onToggleWishlist: (activityId: string) => void;
  onOpenComboBuilder?: () => void;
}

const CATS = [
  { key: "all", label: "All Experiences", emoji: "✨" },
  { key: "combo", label: "Super Savers", emoji: "🎟️" },
  { key: "desert", label: "Desert Safari", emoji: "🏜️" },
  { key: "atv", label: "ATV & Buggy", emoji: "🏎️" },
  { key: "luxury", label: "Premium Luxury", emoji: "✨" },
  { key: "sky", label: "Sky & Balloon", emoji: "🎈" },
  { key: "cruises", label: "Dhow Cruises", emoji: "🚢" },
  { key: "theme-parks", label: "Theme Parks", emoji: "🎢" },
  { key: "water", label: "Yacht & Water", emoji: "⚓" },
  { key: "fishing", label: "Deep Sea Fishing", emoji: "🎣" },
  { key: "helicopter", label: "Helicopter", emoji: "🚁" },
  { key: "scuba", label: "Scuba Diving", emoji: "🤿" },
];

export default function ActivityGrid({ activities, categories, expandedId, selectedId, wishlistItems, initialCategory = "all", onExpand, onSelectPackage, onToggleWishlist, onOpenComboBuilder }: Props) {
  const { t } = useLanguage();
  const { convert } = useCurrency();
  const [cat, setCat] = useState(initialCategory);
  const [interest, setInterest] = useState<string | null>(null);

  useEffect(() => {
    const savedInterest = localStorage.getItem("preferred_category");
    if (savedInterest) setInterest(savedInterest);
  }, []);

  const handleCatChange = (newCat: string) => {
    setCat(newCat);
    if (newCat !== "all") {
      localStorage.setItem("preferred_category", newCat);
      setInterest(newCat);
    }
  };

  const allCats = [
    { key: "all", label: t('grid.all'), emoji: "✨" },
    { key: "combo", label: t('grid.combo'), emoji: "🎟️" },
    ...categories.filter(c => c.isActive).map(c => {
      const config = CATS.find(m => m.key === c.slug);
      return {
        key: c.slug,
        label: t(`cat.${c.slug}`) !== `cat.${c.slug}` ? t(`cat.${c.slug}`) : c.name,
        emoji: config ? config.emoji : (c.icon || '✦')
      };
    })
  ];

  useEffect(() => {
    setCat(initialCategory);
  }, [initialCategory]);

  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Dynamic Personalization: 2026 Intelligence
  const sortedActivities = React.useMemo(() => {
    if (cat !== "all") return activities.filter((a) => a.category === cat);
    if (!interest) return activities;

    // Boost preferred category to the front
    return [...activities].sort((a, b) => {
      if (a.category === interest && b.category !== interest) return -1;
      if (a.category !== interest && b.category === interest) return 1;
      return 0;
    });
  }, [cat, activities, interest]);

  const filtered = sortedActivities;

  // IntersectionObserver scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.idx);
            setVisibleCards((prev) => new Set([...prev, idx]));
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    cardRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [filtered.length]);

  const [promos, setPromos] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/promos?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        const featured = (data.promos || []).filter((p: any) => p.isFeatured && (p.isActive !== false) && new Date(p.expiryDate) > new Date());
        setPromos(featured);
      })
      .catch((err) => console.error("Featured Promos Load Fail:", err));
  }, []);

  return (
    <div id="activities" className="max-w-7xl mx-auto px-5 sm:px-8 py-24">

      {/* ── Section header ── */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="gold-line w-12 flex-shrink-0" />
          <span
            className="text-[0.65rem] tracking-[0.32em] uppercase font-semibold"
            style={{ color: "var(--g300)" }}
          >
            {t('grid.curated')}
          </span>
          <div className="gold-line w-12 flex-shrink-0" />
        </div>
        <h2
          className="fd leading-[1.05] mb-4"
          style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 300 }}
        >
          {t('grid.signature')}{" "}
          <em className="gold-text not-italic" style={{ fontStyle: "normal" }}>{t('grid.adventures')}</em>
        </h2>
        <p className="text-[0.88rem] max-w-md mx-auto leading-[1.75] mb-10" style={{ color: "var(--t3)" }}>
          {t('grid.subtitle')}
        </p>

        {/* Dynamic Featured Promo Banner */}
        {promos.length > 0 && (
          <div className="flex justify-center mb-12">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-4 rounded-full bg-emerald-500/5 border border-emerald-500/20 animate-in fade-in zoom-in-95 duration-1000">
              <div className="flex items-center gap-2">
                <Ticket className="text-emerald-400" size={18} />
                <span className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-emerald-400/80">{t('grid.exclusive_offer')}</span>
              </div>
              <div className="h-4 w-px bg-emerald-500/20 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-[0.85rem] font-bold" style={{ color: "var(--t1)" }}>{promos[0].description || `Save ${promos[0].discountType === 'percentage' ? promos[0].discountValue + '%' : convert(promos[0].discountValue)}`}</span>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-[0.8rem] font-black tracking-widest border border-emerald-500/30">
                  {promos[0].code}
                </span>
              </div>
              <div className="h-4 w-px bg-emerald-500/20 hidden sm:block" />
              <span className="text-[0.6rem] font-bold uppercase tracking-widest text-[#ECC86A]">
                {promos[0].appliesTo === 'all' ? t('grid.valid_sitewide') : t('grid.limited_time')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Category filter ── */}
      <div className="flex items-center gap-2 flex-wrap justify-center mb-12">
        {allCats.map((c) => (
          <button
            key={c.key}
            onClick={() => handleCatChange(c.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[0.75rem] font-semibold tracking-wide transition-all duration-300"
            style={
              cat === c.key
                ? {
                  background: "rgba(212,150,42,0.18)",
                  border: "1.5px solid var(--bg2)",
                  color: "var(--g200)",
                }
                : {
                  background: "var(--bw2)",
                  border: "1px solid var(--bw3)",
                  color: "var(--t2)",
                }
            }
            onMouseEnter={(e) => {
              if (cat !== c.key) {
                (e.currentTarget as HTMLElement).style.color = "var(--t1)";
                (e.currentTarget as HTMLElement).style.background = "var(--bw3)";
              }
            }}
            onMouseLeave={(e) => {
              if (cat !== c.key) {
                (e.currentTarget as HTMLElement).style.color = "var(--t2)";
                (e.currentTarget as HTMLElement).style.background = "var(--bw2)";
              }
            }}
          >
            <span className="text-sm">{c.emoji}</span>
            {c.label}
          </button>
        ))}
      </div>

      {/* ── Combo Builder CTA (Rayna Style) ── */}
      {cat === "combo" && (
        <div
          className="mb-12 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
          style={{
            background: "linear-gradient(135deg, rgba(212,150,42,0.12), rgba(212,150,42,0.02))",
            border: "1px dashed rgba(212,150,42,0.3)"
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-[var(--g300)]/20 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Zap size={32} className="text-[var(--g200)]" />
            </div>
            <div>
              <h3 className="fd text-2xl font-medium mb-2">{t('grid.no_match_title')}</h3>
              <p className="text-[0.88rem] text-white/50 max-w-sm">{t('grid.no_match_subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onOpenComboBuilder}
            className="btn-g px-8 py-4 text-[0.85rem] shadow-[0_10px_30px_rgba(212,150,42,0.25)]"
          >
            {t('grid.build_combo')} <Sparkles size={16} className="ml-2" />
          </button>
        </div>
      )}

      {/* ── Standard Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {filtered.map((activity, i) => (
          <div
            key={activity.id}
            ref={(el) => { cardRefs.current[i] = el; }}
            data-idx={i}
            className="h-full"
            style={{
              opacity: visibleCards.has(i) ? 1 : 0,
              transform: visibleCards.has(i) ? "translateY(0)" : "translateY(36px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
              transitionDelay: `${(i % 3) * 90}ms`,
            }}
          >
            <ActivityCard
              activity={activity}
              isExpanded={expandedId === activity.id}
              isSelected={selectedId === activity.id}
              isWishlisted={wishlistItems.includes(activity.id)}
              onExpand={() => onExpand(activity.id)}
              onToggleWishlist={() => onToggleWishlist(activity.id)}
              promo={promos.find(p =>
                p.isActive !== false &&
                (p.appliesTo === 'all' ||
                  (p.appliesTo === 'category' && (p.categories || []).includes(activity.category)) ||
                  (p.appliesTo === 'specific' && (p.activities || []).includes(activity.id)))
              )}
            />
          </div>
        ))}
      </div>

      {/* Modal removed - now using dedicated pages */}


      {filtered.length === 0 && (
        <div className="text-center py-32 space-y-8 animate-in fade-in zoom-in duration-700">
          <div className="w-20 h-20 rounded-full bg-[var(--s1)] border border-[var(--bw2)] flex items-center justify-center mx-auto text-[var(--t4)] shadow-inner">
            <Compass size={32} className="opacity-20 translate-y-[-2px]" />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="fd text-2xl text-[var(--t1)]">{t('grid.empty.title')}</h3>
              <p className="text-[0.88rem] text-[var(--t3)] max-w-sm mx-auto leading-relaxed">
                Our bespoke concierge team is currently curating new premium experiences for the <span className="text-[var(--t2)] font-bold italic">{allCats.find(c => c.key === cat)?.label}</span> collection.
                <br /><br />
                Please check back shortly or explore our other signature adventures.
              </p>
            </div>

            {cat !== "all" && (
              <button
                onClick={() => setCat("all")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--bw1)] border border-[var(--bw2)] text-[0.7rem] font-black uppercase tracking-widest text-[var(--t1)] hover:bg-[#D4962A] hover:text-black transition-all"
              >
                {t('grid.empty.back')} <Sparkles size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

