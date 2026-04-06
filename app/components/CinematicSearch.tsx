"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, MapPin, Star, ArrowRight, Loader2, Compass, Bot, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Activity } from "../types";
import { useCurrency } from "../context/CurrencyContext";
import { useLanguage } from "../context/LanguageContext";
import clsx from "clsx";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const LUXE_CATEGORIES = [
  { label: "Luxury", emoji: "✨", color: "rgba(212,150,42,0.12)" },
  { label: "Desert", emoji: "🏜", color: "rgba(184,134,11,0.12)" },
  { label: "Adventure", emoji: "🏍", color: "rgba(236,200,106,0.12)" },
  { label: "Sky", emoji: "🎈", color: "rgba(100,149,237,0.12)" }
];

export default function CinematicSearch({ isOpen, onClose }: Props) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [results, setResults] = useState<Activity[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { convert } = useCurrency();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Trigger (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("openSearch"));
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll and focus
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => setIsLoaded(true), 50);
      setTimeout(() => inputRef.current?.focus(), 300);

      fetch("/api/activities")
        .then(res => res.json())
        .then(data => setActivities(data.activities || []))
        .catch(err => console.error("Search fetch error", err));
    } else {
      document.body.style.overflow = "unset";
      setIsLoaded(false);
      setQuery("");
      setResults([]);
      setActiveVibe(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setActiveVibe(null);
      return;
    }

    const searchTerms = query.toLowerCase().split(' ');
    const filtered = activities.filter(a => {
      const target = `${a.title} ${a.category} ${a.subtitle || ""}`.toLowerCase();
      return searchTerms.every(term => target.includes(term));
    }).slice(0, 6);

    const foundVibe = LUXE_CATEGORIES.find(v => query.toLowerCase().includes(v.label.toLowerCase()));

    // ── Intelligent Analysis Delay Simulation ──
    setIsSearching(true);
    const timer = setTimeout(() => {
      setResults(filtered);
      setActiveVibe(foundVibe?.color || null);
      setIsSearching(false);
    }, filtered.length > 0 ? 0 : 800);

    return () => clearTimeout(timer);
  }, [query, activities]);

  if (!isOpen) return null;

  const firstResultImage = results[0]?.image;

  return (
    <div
      className={clsx(
        "fixed inset-0 z-[100] flex flex-col items-center bg-[var(--s0)]/98 backdrop-blur-[80px] transition-all duration-1000",
        isLoaded ? "opacity-100" : "opacity-0"
      )}
    >
      {/* ── Immersive Preview Backdrop (The Mastery Touch) ── */}
      {firstResultImage && query && (
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none transition-all duration-1000 animate-in fade-in">
          <Image src={firstResultImage} alt="Preview" fill className="object-cover scale-110 blur-2xl" />
        </div>
      )}

      {/* ── Neural Scan Indicator ─────────────────── */}
      {query && (
        <div className="absolute top-0 left-0 w-full h-[2px] z-[120] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-[#D4962A] to-transparent w-1/3 animate-scan" />
        </div>
      )}

      {/* ── Top Intelligence Bar ─────────────────── */}
      <div className="w-full max-w-7xl px-8 py-8 flex items-center justify-between border-b border-white/5 relative z-[110]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D4962A]/10 border border-[#D4962A]/20 flex items-center justify-center">
            <Compass size={16} className="text-[#D4962A] animate-spin-slow" />
          </div>
          <span className="text-[0.6rem] uppercase tracking-[0.4em] text-[var(--t3)] font-black">Emirates Index v2026.4</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="hidden sm:inline-flex items-center gap-2 text-[0.55rem] text-[var(--t4)] uppercase font-bold tracking-widest px-3 py-1 rounded-md bg-white/5">
            ESC <div className="w-1.5 h-1.5 rounded-full bg-red-500/40" /> CLOSE
          </span>
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-white/5 text-[var(--t2)] hover:text-white transition-all group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform" />
          </button>
        </div>
      </div>

      {/* ── Search Core ───────────────────────────── */}
      <div className="w-full max-w-6xl px-10 pt-16 sm:pt-24 flex flex-col items-center gap-12 relative z-[110]">

        {/* Editorial Search Bar */}
        <div className="w-full max-w-3xl space-y-8">
          <div className="relative group flex items-center bg-[var(--s1)] border border-[var(--bw2)] rounded-[2rem] px-8 py-6 backdrop-blur-2xl transition-all duration-500 hover:border-[#D4962A]/30 hover:bg-[var(--s2)] shadow-2xl">
            <Search className={clsx("transition-all duration-700", query ? "text-[#D4962A] scale-110" : "text-[var(--t4)]")} size={28} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent border-none text-left pl-6 text-2xl sm:text-3xl fd font-light text-[var(--t1)] placeholder:text-[var(--t3)] outline-none selection:bg-[#D4962A]/20"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-2 rounded-full hover:bg-white/10 text-[var(--t4)] transition-colors"
              >
                <X size={20} />
              </button>
            )}
            {/* Intelligent Scanning Badge */}
            <div className={clsx(
              "absolute right-10 flex items-center gap-3 transition-opacity duration-500",
              isSearching ? "opacity-100" : "opacity-0"
            )}>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-[#D4962A] animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />)}
              </div>
              <span className="text-[0.6rem] font-black uppercase tracking-widest text-[#D4962A]">{t('search.analyzing')}</span>
            </div>
            {/* Advanced Intelligence Ring */}
            <div className={clsx(
              "absolute -inset-[2px] rounded-[2rem] opacity-0 transition-opacity duration-1000 pointer-events-none",
              query && "opacity-100"
            )}
              style={{
                background: "linear-gradient(45deg, transparent, rgba(212,150,42,0.3), transparent)",
                padding: '2px',
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude"
              }} />
          </div>

          {/* Luxury Category Nodes */}
          <div className="flex flex-wrap items-center justify-center gap-5 pt-2 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {LUXE_CATEGORIES.map((v, i) => (
              <button
                key={v.label}
                onClick={() => setQuery(v.label)}
                className={clsx(
                  "flex items-center gap-3 px-7 py-3 rounded-2xl border text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all duration-700",
                  query.toLowerCase().includes(v.label.toLowerCase())
                    ? "bg-[#D4962A] text-black border-transparent scale-105 shadow-2xl shadow-[#D4962A]/30"
                    : "bg-white/[0.03] border-white/5 text-[var(--t3)] hover:border-[#D4962A]/40 hover:text-[var(--t1)] hover:-translate-y-1"
                )}
              >
                <span className="text-xl filter grayscale group-hover:grayscale-0 transition-all">{v.emoji}</span>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Gallery Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-10 pb-40">
          {results.map((res, i) => (
            <Link
              key={res.id}
              href={`/experience/${res.id}`}
              onClick={onClose}
              className="group relative flex items-center gap-8 p-6 rounded-[3rem] bg-gradient-to-br from-white/[0.02] to-transparent border border-white/5 hover:border-[#D4962A]/40 transition-all duration-1000 hover:shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-12"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Advanced Thumbnail Visual */}
              <div className="relative w-40 h-52 rounded-[2.5rem] overflow-hidden flex-shrink-0 shadow-2xl transition-all duration-1000 group-hover:scale-[1.05] group-hover:rounded-[2.8rem]">
                <Image
                  src={res.image || "/images/placeholder.jpg"}
                  alt={res.title}
                  fill
                  className="object-cover transition-transform duration-[2s] group-hover:scale-125"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-[0.5rem] font-black text-[#D4962A] tracking-widest uppercase flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4962A] animate-pulse" />
                  {t('search.match_score')}: 98%
                </div>
              </div>

              <div className="flex-1 space-y-6 pt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-[0.6rem] font-black uppercase tracking-[0.4em] text-[var(--t4)]">
                    <span className="text-[#D4962A]">{res.category}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <span>{res.duration}</span>
                  </div>
                  <h3 className="text-3xl font-light text-[var(--t1)] leading-tight tracking-tight group-hover:text-[#ECC86A] transition-colors line-clamp-2">{res.title}</h3>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[0.55rem] text-[var(--t5)] uppercase font-black tracking-[0.2em]">{t('search.investment')}</span>
                    <span className="text-2xl font-black text-[#D4962A] tracking-tighter">{convert(res.price)}</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center transition-all duration-500 group-hover:bg-[#D4962A] group-hover:text-black group-hover:rotate-12 group-hover:scale-110">
                    <ArrowRight size={22} className="-rotate-45 group-hover:rotate-0 transition-transform duration-500" />
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {query && results.length === 0 && !isSearching && (
            <div className="col-span-full flex flex-col items-center text-center py-10 space-y-10 animate-in zoom-in duration-1000">
              <div className="relative">
                <div className="absolute -inset-8 bg-[#D4962A]/10 blur-3xl animate-pulse" />
                <div className="relative w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#1A1A1A] to-black flex items-center justify-center border border-[#D4962A]/30 transition-transform hover:scale-110">
                  <Bot size={48} className="text-[#D4962A] animate-bounce-slow" />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-4xl fd font-light text-[var(--t1)] italic">{t('search.no_exact_match_title')}</h4>
                <p className="text-[0.75rem] uppercase tracking-[0.5em] text-[var(--t4)] max-w-lg mx-auto leading-relaxed opacity-60">{t('search.no_exact_match_sub')}</p>
              </div>
              <button
                onClick={() => { onClose(); (document.querySelector('#ai-planner-btn') as HTMLElement)?.click(); }}
                className="px-12 py-6 rounded-full bg-gradient-to-r from-[#D4962A] to-[#ECC86A] text-black text-[0.75rem] font-black uppercase tracking-[0.4em] hover:scale-105 transition-all shadow-2xl shadow-[#D4962A]/40 flex items-center gap-5 group"
              >
                {t('search.initiate_ai')} <Sparkles size={20} className="group-hover:rotate-90 transition-transform duration-700" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Extreme Low-Opacity Background Decal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(212,150,42,0.03),transparent_70%)] pointer-events-none" />
    </div>
  );
}

