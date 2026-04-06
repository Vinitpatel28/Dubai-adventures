"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Compass, User, Sun, Moon, ChevronDown, Search, Globe, ShoppingCart, Star, Clock, ArrowRight, MapPin } from "lucide-react";
import AuthModal from "./AuthModal";
import { useLanguage, LANGUAGES } from "../context/LanguageContext";
import { useCurrency, CURRENCIES, type CurrencyCode } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import GlobalSelector from "./GlobalSelector";
import { Activity } from "../types";

interface NavbarProps {
  hasBooking: boolean;
  categories: any[];
  onSelectCategory?: (category: string) => void;
  forceDark?: boolean;
  activities?: Activity[];
}

const NAV_LINK_KEYS = [
  { key: "about", href: "/about" },
  { key: "bookings", href: "/bookings" },
  { key: "contact", href: "/contact" },
];

const CAT_LINKS = [
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

export default function Navbar({ categories = [], onSelectCategory, activities: activitiesProp, forceDark }: NavbarProps) {
  const { language, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { count: cartCount } = useCart();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isDark, setIsDark] = useState(true);
  const [catsOpen, setCatsOpen] = useState(false);
  const [isGlobalOpen, setIsGlobalOpen] = useState(false);

  // Inline Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [searchResults, setSearchResults] = useState<Activity[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);



  const catsRef = useRef<HTMLLIElement>(null);
  const { convert } = useCurrency();

  // Combine fetched categories with the static "Combo" one
  const allCats = [
    { slug: 'combo', name: t('cat.combo'), emoji: '🎟️' },
    ...categories.map(c => {
      const config = CAT_LINKS.find(m => m.key === c.slug);
      return {
        slug: c.slug,
        name: t(`cat.${c.slug}`) !== `cat.${c.slug}` ? t(`cat.${c.slug}`) : c.name,
        emoji: config ? config.emoji : (c.icon || '✦')
      };
    })
  ];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) setCatsOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) { setSearchOpen(false); setSearchQuery(""); }

    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const dark = saved ? saved === "dark" : true;
    setIsDark(dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    const theme = next ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });

    const onOpenAuthModal = () => {
      setAuthMode("login");
      setIsAuthModalOpen(true);
    };
    window.addEventListener("openAuthModal", onOpenAuthModal);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("openAuthModal", onOpenAuthModal);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    const onOpenGlobal = () => setIsGlobalOpen(true);
    window.addEventListener("openGlobal", onOpenGlobal);
    return () => {
      window.removeEventListener("openGlobal", onOpenGlobal);
    };
  }, []);

  // Use activities from prop if available, otherwise lazy-fetch for non-homepage pages
  useEffect(() => {
    if (activitiesProp) {
      setAllActivities(activitiesProp);
      return;
    }
    // Only fetch when search is opened
    if (searchOpen && allActivities.length === 0) {
      fetch("/api/activities")
        .then(res => res.json())
        .then(data => setAllActivities(data.activities || []))
        .catch(() => {});
    }
  }, [activitiesProp, searchOpen, allActivities.length]);

  // Inline search filtering (Now memoized for performance)
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    
    const filterResults = () => {
      const terms = searchQuery.toLowerCase().split(' ');
      return allActivities.filter(a => {
        const target = `${a.title} ${a.category} ${a.subtitle || ""} ${a.shortDescription || ""}`.toLowerCase();
        return terms.every(term => target.includes(term));
      }).slice(0, 5);
    };

    const timeout = setTimeout(() => {
      setSearchResults(filterResults());
    }, 150); // Debounce to prevent lag

    return () => clearTimeout(timeout);
  }, [searchQuery, allActivities]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleSearchSelect = (activity: Activity) => {
    setSearchOpen(false);
    setSearchQuery("");
    const el = document.getElementById("experiences");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      const card = document.getElementById(`card-${activity.id}`);
      if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
  };

  return (
    <>
      <GlobalSelector isOpen={isGlobalOpen} onClose={() => setIsGlobalOpen(false)} />

      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled
          ? "glass-nav shadow-[0_4px_40px_rgba(0,0,0,0.3)] border-b border-white/10"
          : "bg-gradient-to-b from-black/80 via-black/30 to-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 flex items-center justify-center logo-shimmer">
                <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                  <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" stroke="url(#lg1)" strokeWidth="1.4" fill="none" />
                  <polygon points="16,8 24,12 24,20 16,24 8,20 8,12" fill="url(#lg2)" opacity="0.18" />
                  <circle cx="16" cy="16" r="3" fill="url(#lg1)" />
                  <defs>
                    <linearGradient id="lg1" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#6E420C" /><stop offset="0.45" stopColor="#ECC86A" /><stop offset="1" stopColor="#6E420C" />
                    </linearGradient>
                    <linearGradient id="lg2" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#D4962A" /><stop offset="1" stopColor="#6E420C" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span
                className="fd text-[1.12rem] font-light tracking-wide transition-colors"
                style={{ color: scrolled ? "var(--t1)" : "white" }}
              >
                Dubai <em className="gold-text not-italic font-medium">Adventures</em>
              </span>
            </Link>

            <ul className="hidden md:flex items-center gap-7">
              {NAV_LINK_KEYS.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="relative text-[0.725rem] tracking-[0.2em] uppercase font-bold group transition-all duration-250"
                    style={{ color: scrolled ? "var(--t2)" : "rgba(255,255,255,0.95)" }}
                  >
                    <span className="hover:text-white transition-colors">{t(`nav.${link.key}`)}</span>
                    <span
                      className="absolute -bottom-0.5 left-0 w-0 h-px group-hover:w-full transition-all duration-350 ease-out"
                      style={{ background: "var(--g200)" }}
                    />
                  </Link>
                </li>
              ))}

              {/* Categories Sub-menu */}
              <li className="relative" ref={catsRef}>
                <button
                  onClick={() => setCatsOpen(!catsOpen)}
                  className="flex items-center gap-1.5 text-[0.725rem] tracking-[0.2em] uppercase font-bold transition-all duration-350 hover:text-white"
                  style={{ color: scrolled ? "var(--t2)" : "rgba(255,255,255,0.95)" }}
                >
                  {t('nav.categories')} <ChevronDown size={12} className={`transition-transform duration-300 ${catsOpen ? 'rotate-180' : ''}`} />
                </button>

                {catsOpen && (
                  <div className="absolute left-0 top-full mt-5 w-64 dropdown-glass rounded-2xl p-4 a-down z-50 overflow-hidden theme-force-auto shadow-2xl">
                    <div className="grid grid-cols-1 gap-1">
                      {allCats.map(c => (
                        <button
                          key={c.slug}
                          onClick={() => {
                            setCatsOpen(false);
                            if (onSelectCategory) {
                              onSelectCategory(c.slug);
                            } else {
                              window.location.href = `/?category=${encodeURIComponent(c.slug)}#experiences`;
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.75rem] text-[var(--t1)] font-bold hover:bg-white/5 transition-all group"
                        >
                          <span className="text-sm group-hover:scale-110 transition-transform">{c.emoji}</span>
                          <span className="uppercase tracking-widest leading-none">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            </ul>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Inline Search */}
              <div className="relative" ref={searchRef}>
                <button
                  className="p-2 rounded-full hover:bg-white/5 transition-all"
                  onClick={() => { setSearchOpen(!searchOpen); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                  style={{ color: scrolled ? "var(--t2)" : "white" }}
                >
                  <Search size={19} />
                </button>

                {searchOpen && (
                  <div className="absolute right-0 top-full mt-3 w-[380px] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[var(--bw2)] z-[200]"
                    style={{ background: "var(--s0)" }}
                  >
                    {/* Search Input */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--bw1)]">
                      <Search size={16} className="text-[var(--g300)] flex-shrink-0" />
                      <input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search experiences..."
                        className="flex-1 bg-transparent border-none text-[var(--t1)] text-sm placeholder:text-[var(--t4)] outline-none"
                      />
                      <span className="text-[0.55rem] text-[var(--t4)] uppercase tracking-widest font-bold px-2 py-1 rounded bg-[var(--s1)] border border-[var(--bw1)]">
                        ESC
                      </span>
                    </div>

                    {/* Results */}
                    <div className="max-h-[360px] overflow-y-auto">
                      {searchResults.length > 0 ? (
                        <div className="py-2">
                          {searchResults.map((r) => (
                            <button
                              key={r.id}
                              onClick={() => handleSearchSelect(r)}
                              className="w-full flex items-center gap-4 px-5 py-3 hover:bg-[var(--s1)] transition-all text-left group"
                            >
                              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--bw1)]">
                                <Image src={r.image} alt={r.title} width={48} height={48} className="object-cover w-full h-full" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[var(--t1)] text-sm font-semibold truncate group-hover:text-[var(--g300)] transition-colors">{r.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[0.6rem] text-[var(--g300)] font-bold uppercase tracking-wider">{r.category}</span>
                                  <span className="w-1 h-1 rounded-full bg-[var(--t4)]" />
                                  <span className="text-[0.6rem] text-[var(--t3)]">{r.duration}</span>
                                </div>
                              </div>
                              <span className="text-[var(--g300)] font-bold text-sm fd">{convert(r.price)}</span>
                            </button>
                          ))}
                        </div>
                      ) : searchQuery.trim() ? (
                        <div className="py-8 text-center">
                          <p className="text-[var(--t3)] text-sm">No experiences found</p>
                          <p className="text-[var(--t4)] text-[0.7rem] mt-1">Try a different search term</p>
                        </div>
                      ) : (
                        <div className="py-6 px-5">
                          <p className="text-[0.6rem] text-[var(--t4)] uppercase tracking-widest font-bold mb-3">Popular Searches</p>
                          <div className="flex flex-wrap gap-2">
                            {["Desert Safari", "Yacht", "Helicopter", "Theme Parks", "Scuba"].map(q => (
                              <button
                                key={q}
                                onClick={() => setSearchQuery(q)}
                                className="px-3 py-1.5 rounded-full bg-[var(--s1)] border border-[var(--bw1)] text-[0.68rem] text-[var(--t2)] font-medium hover:bg-[var(--s2)] hover:text-[var(--t1)] transition-all"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Icon with Badge — links to /cart page */}
              <Link
                href="/cart"
                className="relative p-2 rounded-full hover:bg-white/5 transition-all"
                style={{ color: scrolled ? "var(--t2)" : "white" }}
              >
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[var(--g300)] text-[#050403] text-[0.6rem] font-black flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Theme Toggle (Desktop Only) */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full border transition-all duration-300 hover:scale-110"
                style={{
                  borderColor: scrolled ? "var(--bw2)" : "rgba(255,255,255,0.2)",
                  background: scrolled ? "var(--bw1)" : "rgba(255,255,255,0.1)",
                  color: scrolled ? "var(--t2)" : "white"
                }}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Auth Buttons */}
              <div className="hidden sm:flex items-center gap-2">
                {user ? (
                  <div className="flex items-center gap-2">
                    <Link href="/bookings" className="hidden lg:inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-wider py-1.5 pl-1.5 pr-4 rounded-full border transition-all"
                      style={{ borderColor: scrolled ? "var(--bw2)" : "rgba(255,255,255,0.2)", background: scrolled ? "var(--bw1)" : "rgba(255,255,255,0.1)", color: scrolled ? "var(--t2)" : "white" }}
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-[var(--g500)] to-[var(--g300)] shadow-lg">
                        <User size={13} style={{ color: "#06040A" }} />
                      </span>
                      {user?.name || 'Account'}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-full border text-[0.65rem] font-bold tracking-[0.15em] uppercase transition-all duration-300 hover:bg-red-500/10 hover:text-red-500 active:scale-95"
                      style={{
                        borderColor: scrolled ? "var(--bw2)" : "rgba(255,255,255,0.2)",
                        background: scrolled ? "var(--bw1)" : "rgba(255,255,255,0.1)",
                        color: scrolled ? "var(--t2)" : "white"
                      }}
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAuthMode("login"); setIsAuthModalOpen(true); }}
                    className="flex items-center px-4 py-2 sm:px-6 rounded-full text-[0.72rem] font-bold tracking-[0.1em] uppercase transition-all duration-350 btn-g shadow-lg active:scale-95"
                  >
                    {t('nav.join')}
                  </button>
                )}
              </div>

              {/* Language Selector */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsGlobalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full border text-[0.68rem] font-bold tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                  style={{
                    borderColor: scrolled ? "var(--bw2)" : "rgba(255,255,255,0.2)",
                    background: scrolled ? "var(--bw1)" : "rgba(255,255,255,0.1)",
                    color: scrolled ? "var(--t2)" : "white"
                  }}
                >
                  {language === 'ar' ? (
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 relative flex-shrink-0">
                      <Image
                        src="https://flagcdn.com/w40/ae.png"
                        alt="Arabic"
                        fill
                        sizes="20px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <Globe size={15} className={scrolled ? "text-[var(--g400)]" : "text-white/80"} />
                  )}
                  <span className="opacity-90 tracking-[0.1em]">{language.toUpperCase()}</span>
                </button>
              </div>

              {/* Currency Selector */}
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsGlobalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full border text-[0.68rem] font-bold tracking-widest transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm"
                  style={{
                    borderColor: scrolled ? "var(--g300)" : "white",
                    background: scrolled ? "var(--g300)" : "transparent",
                    color: scrolled ? "#06040A" : "white"
                  }}
                >
                  {currency}
                </button>
              </div>

              {/* Mobile Menu Icon */}
              <button
                className="md:hidden p-2 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ color: scrolled ? "var(--t2)" : "white" }}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div
            className="md:hidden px-5 pb-8 pt-2 a-down max-h-[85vh] overflow-y-auto"
            style={{ borderTop: "1px solid var(--bw1)", background: "var(--s1)" }}
          >
            {user ? (
              <div className="py-5 border-b border-[var(--bw1)] mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--g500)] to-[var(--g300)] flex items-center justify-center shadow-lg">
                    <User size={18} className="text-[#06040A]" />
                  </div>
                  <div>
                    <p className="text-[0.75rem] font-bold text-[var(--t1)] uppercase tracking-wider">{user.name}</p>
                    <p className="text-[0.6rem] text-[var(--t3)] truncate max-w-[180px]">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 text-[0.65rem] font-black uppercase tracking-[0.2em] bg-red-500/5 hover:bg-red-500/10 transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 py-5 border-b border-[var(--bw1)] mb-4">
                <button
                  onClick={() => { setAuthMode("login"); setIsAuthModalOpen(true); setMenuOpen(false); }}
                  className="py-3 rounded-xl border border-[var(--bw2)] text-[var(--t2)] text-[0.65rem] font-black uppercase tracking-widest"
                >
                  Login
                </button>
                <button
                  onClick={() => { setAuthMode("signup"); setIsAuthModalOpen(true); setMenuOpen(false); }}
                  className="py-3 rounded-xl bg-gradient-to-r from-[var(--g400)] to-[var(--g300)] text-[#06040A] text-[0.65rem] font-black uppercase tracking-widest shadow-lg"
                >
                  Sign Up
                </button>
              </div>
            )}

            <div className="space-y-1 mb-6">
              {NAV_LINK_KEYS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 py-3.5 px-3 rounded-xl text-[0.75rem] tracking-[0.2em] uppercase font-bold text-[var(--t2)] hover:text-[var(--t1)] hover:bg-white/5 transition-all"
                >
                  <Compass size={16} className="text-[var(--g300)] opacity-60" />
                  {t(`nav.${link.key}`)}
                </Link>
              ))}
              <button
                onClick={() => { setIsGlobalOpen(true); setMenuOpen(false); }}
                className="w-full flex items-center gap-4 py-3.5 px-3 rounded-xl text-[0.75rem] tracking-[0.2em] uppercase font-bold text-[var(--t2)] hover:text-[var(--t1)] hover:bg-white/5 transition-all text-left"
              >
                <Globe size={16} className="text-[var(--g300)] opacity-60" />
                Language & Currency
              </button>
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .logo-shimmer:hover svg {
          filter: drop-shadow(0 0 8px var(--g300));
          transition: all 0.5s ease;
        }
      `}</style>
    </>
  );
}
