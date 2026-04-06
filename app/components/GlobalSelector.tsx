"use client";

import { useState, useEffect } from "react";
import { X, Globe, DollarSign, Check, Sparkles, Languages, Info } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency, CURRENCIES, CurrencyCode } from "../context/CurrencyContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface GlobalSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

// ═══════════════════════════════════════════════
//  SVG FLAGS via flagcdn.com CDN
//  Works on ALL platforms (Windows, Mac, Android)
// ═══════════════════════════════════════════════
const TRANSLATE_LANGUAGES = [
  { code: "en",    label: "English",    countryCode: "gb", native: "English" },
  { code: "ar",    label: "Arabic",     countryCode: "ae", native: "العربية" },
  { code: "fr",    label: "French",     countryCode: "fr", native: "Français" },
  { code: "ru",    label: "Russian",    countryCode: "ru", native: "Русский" },
  { code: "de",    label: "German",     countryCode: "de", native: "Deutsch" },
  { code: "zh-CN", label: "Chinese",    countryCode: "cn", native: "中文" },
  { code: "hi",    label: "Hindi",      countryCode: "in", native: "हिन्दी" },
  { code: "ja",    label: "Japanese",   countryCode: "jp", native: "日本語" },
  { code: "ko",    label: "Korean",     countryCode: "kr", native: "한국어" },
  { code: "es",    label: "Spanish",    countryCode: "es", native: "Español" },
  { code: "pt",    label: "Portuguese", countryCode: "pt", native: "Português" },
  { code: "it",    label: "Italian",    countryCode: "it", native: "Italiano" },
  { code: "tr",    label: "Turkish",    countryCode: "tr", native: "Türkçe" },
];

export default function GlobalSelector({ isOpen, onClose }: GlobalSelectorProps) {
  const { currency, setCurrency } = useCurrency();
  const { setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<"language" | "currency">("language");
  const [activeLang, setActiveLang] = useState("en");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Detect current language from cookie or localStorage
      const saved = localStorage.getItem('language');
      if (saved) {
        const mapped = saved === 'zh' ? 'zh-CN' : saved;
        setActiveLang(mapped);
      } else {
        const match = document.cookie.match(/googtrans=\/en\/([a-z-]+)/i);
        setActiveLang(match ? match[1] : "en");
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleLanguageSelect = (langCode: string) => {
    const contextLang = langCode === 'zh-CN' ? 'zh' : langCode;
    setLanguage(contextLang as any);
    setActiveLang(langCode);

    // Try Google Translate DOM widget first (instant, no reload)
    const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (selectEl) {
      if (langCode === 'en') {
        selectEl.value = '';
        selectEl.dispatchEvent(new Event('change'));
        setTimeout(() => { window.location.reload(); }, 300);
      } else {
        selectEl.value = langCode;
        selectEl.dispatchEvent(new Event('change'));
        setTimeout(() => onClose(), 500);
      }
      return;
    }

    // Fallback: cookie is set by setLanguage(), reload to activate
    setTimeout(() => { window.location.reload(); }, 400);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" onClick={onClose} />

        {/* Ambient light */}
        <div className="absolute top-[10%] left-[15%] w-[30%] h-[30%] bg-[var(--g300)]/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-[var(--s0)] border border-[var(--bw2)] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
          style={{ maxHeight: '85vh' }}
        >
          {/* ── Header ── */}
          <div className="px-6 py-5 border-b border-[var(--bw1)] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--g300)]/10 flex items-center justify-center text-[var(--g300)]">
                <Globe size={20} />
              </div>
              <div>
                <h2 className="fd text-xl font-medium text-[var(--t1)] italic tracking-wide notranslate">Regional Preferences</h2>
                <p className="text-[0.55rem] uppercase tracking-[0.25em] font-black text-[var(--t3)] notranslate">Dubai Adventures · Global Hub</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[var(--bw1)] border border-[var(--bw2)] flex items-center justify-center text-[var(--t2)] hover:text-[var(--t1)] hover:bg-[var(--bw2)] transition-all hover:rotate-90"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Tab Row (Horizontal) ── */}
          <div className="flex items-center gap-2 px-6 py-3 border-b border-[var(--bw1)] flex-shrink-0">
            <button
              onClick={() => setActiveTab("language")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all text-[0.7rem] uppercase tracking-widest font-bold ${
                activeTab === 'language'
                  ? 'bg-[var(--g300)] text-[#000]'
                  : 'text-[var(--t2)] hover:bg-[var(--bw1)] hover:text-[var(--t1)]'
              }`}
            >
              <Languages size={14} />
              <span className="notranslate">Language</span>
            </button>
            <button
              onClick={() => setActiveTab("currency")}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all text-[0.7rem] uppercase tracking-widest font-bold ${
                activeTab === 'currency'
                  ? 'bg-[var(--g300)] text-[#000]'
                  : 'text-[var(--t2)] hover:bg-[var(--bw1)] hover:text-[var(--t1)]'
              }`}
            >
              <DollarSign size={14} />
              <span className="notranslate">Currency</span>
            </button>
          </div>

          {/* ── Scrollable Content ── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5" style={{ minHeight: 0 }}>
            {activeTab === "language" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TRANSLATE_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageSelect(l.code)}
                    className={`notranslate group relative flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-300 ${
                      activeLang === l.code
                        ? 'border-[var(--g300)] bg-[var(--g300)]/10 shadow-[0_0_20px_rgba(212,150,42,0.1)]'
                        : 'border-[var(--bw1)] bg-[var(--bw5)] hover:border-[var(--bw2)] hover:bg-[var(--bw1)]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* SVG Flag from CDN — works on ALL platforms */}
                      <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[var(--bw2)] flex-shrink-0 relative shadow-lg group-hover:border-[var(--bw3)] transition-all">
                        <Image
                          src={`https://flagcdn.com/w80/${l.countryCode}.png`}
                          alt={l.label}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-semibold tracking-wide ${activeLang === l.code ? 'text-[var(--g300)]' : 'text-[var(--t1)]'}`}>{l.label}</p>
                        <p className="text-[0.6rem] text-[var(--t3)] uppercase tracking-widest font-black">{l.native}</p>
                      </div>
                    </div>
                    {activeLang === l.code && (
                      <div className="w-7 h-7 rounded-full bg-[var(--g300)] flex items-center justify-center text-black flex-shrink-0">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setCurrency(c.code as CurrencyCode)}
                      className={`group flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-500 ${
                        currency === c.code
                          ? 'border-[var(--g300)] bg-[var(--g300)]/10 scale-[1.03] shadow-[0_0_25px_rgba(212,150,42,0.12)]'
                          : 'border-[var(--bw1)] bg-[var(--bw5)] hover:border-[var(--bw2)] hover:scale-[1.02]'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mb-3 transition-all duration-500 ${
                        currency === c.code ? 'bg-[var(--g300)] text-[#000]' : 'bg-[var(--bw1)] text-[var(--t2)]'
                      }`}>
                        {c.symbol}
                      </div>
                      <p className={`text-base font-bold tracking-tight ${currency === c.code ? 'text-[var(--g300)]' : 'text-[var(--t1)]'}`}>{c.code}</p>
                      <p className="text-[0.55rem] uppercase tracking-widest text-[var(--t3)] font-black text-center mt-1 notranslate">{c.label}</p>
                    </button>
                  ))}
                </div>

                {/* Currency disclaimer */}
                <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--bw5)] border border-[var(--bw1)]">
                  <Info size={14} className="text-[var(--g300)] flex-shrink-0 mt-0.5" />
                  <p className="text-[0.65rem] leading-relaxed text-[var(--t3)] notranslate">
                    Prices shown in your selected currency are <span className="text-[var(--t1)] font-semibold">approximate conversions</span> for reference only. 
                    All payments are processed in <span className="text-[var(--g300)] font-bold">AED (UAE Dirham)</span>. 
                    Exchange rates are updated periodically and may vary at the time of payment.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ── Footer pill ── */}
          <div className="px-6 py-3 border-t border-[var(--bw1)] flex-shrink-0">
            <div className="flex items-center justify-center gap-2 text-[var(--t4)]">
              <Sparkles size={10} />
              <span className="text-[0.55rem] uppercase tracking-[0.2em] font-black notranslate">
                {activeTab === 'language' ? 'Powered by Google Translate' : 'Display conversion only · Final charge in AED'}
              </span>
              <Sparkles size={10} />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
