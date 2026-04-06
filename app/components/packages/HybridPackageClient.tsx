'use client';

import { useState, useEffect, useReducer, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '../Navbar';
import Footer from '../Footer';
import InclusionsBar from './InclusionsBar';
import DayTimeline from './DayTimeline';
import ModuleCard from './ModuleCard';
import PriceBar from './PriceBar';
import { useCurrency } from '../../context/CurrencyContext';
import { ArrowLeft, Calendar, Users, Shield, Star } from 'lucide-react';

// ── State management for dynamic pricing ──────────────────────────────
interface PriceState {
  removedModules: Set<string>;
  selectedUpgrades: Map<string, string>; // moduleId -> upgradeId
  adjustedPrice: number;
}

type PriceAction =
  | { type: 'REMOVE_MODULE'; moduleId: string; cost: number }
  | { type: 'RESTORE_MODULE'; moduleId: string; cost: number }
  | { type: 'SELECT_UPGRADE'; moduleId: string; upgradeId: string; delta: number }
  | { type: 'RESET'; basePrice: number };

function priceReducer(state: PriceState, action: PriceAction): PriceState {
  switch (action.type) {
    case 'REMOVE_MODULE': {
      const removed = new Set(state.removedModules);
      removed.add(action.moduleId);
      return { ...state, removedModules: removed, adjustedPrice: state.adjustedPrice - action.cost };
    }
    case 'RESTORE_MODULE': {
      const removed = new Set(state.removedModules);
      removed.delete(action.moduleId);
      return { ...state, removedModules: removed, adjustedPrice: state.adjustedPrice + action.cost };
    }
    case 'SELECT_UPGRADE': {
      const upgrades = new Map(state.selectedUpgrades);
      upgrades.set(action.moduleId, action.upgradeId);
      return { ...state, selectedUpgrades: upgrades, adjustedPrice: state.adjustedPrice + action.delta };
    }
    case 'RESET':
      return { removedModules: new Set(), selectedUpgrades: new Map(), adjustedPrice: action.basePrice };
    default:
      return state;
  }
}

export default function HybridPackageClient({ activity: pkg, categories }: { activity: any, categories: any[] }) {
  const router = useRouter();
  const { convert } = useCurrency();

  const [activeDay, setActiveDay] = useState(1);
  const dayRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const [priceState, dispatch] = useReducer(priceReducer, {
    removedModules: new Set<string>(),
    selectedUpgrades: new Map<string, string>(),
    adjustedPrice: pkg.price || 0,
  });

  useEffect(() => {
    dispatch({ type: 'RESET', basePrice: pkg.price || 0 });
  }, [pkg]);

  // Scroll spy for day tracking
  useEffect(() => {
    if (!pkg) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const day = Number(entry.target.getAttribute('data-day'));
            if (day) setActiveDay(day);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );

    dayRefs.current.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [pkg]);

  const scrollToDay = (dayNum: number) => {
    const el = dayRefs.current.get(dayNum);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRemoveModule = (moduleId: string, cost: number) => {
    if (priceState.removedModules.has(moduleId)) {
      dispatch({ type: 'RESTORE_MODULE', moduleId, cost });
    } else {
      dispatch({ type: 'REMOVE_MODULE', moduleId, cost });
    }
  };

  const handleUpgrade = (moduleId: string, upgradeId: string, delta: number) => {
    dispatch({ type: 'SELECT_UPGRADE', moduleId, upgradeId, delta });
  };

  const handleBook = () => {
    // Navigate to the unified checkout system, passing the adjusted price as a "deposit" or context reference if needed.
    // In a fully integrated system, and since this is a luxury package, they will pay the price at checkout as a holding deposit.
    router.push(`/book/${pkg.id}?package=true&price=${priceState.adjustedPrice}`);
  };

  if (!pkg) return null;

  return (
    <main className="min-h-screen bg-[var(--s0)] text-[var(--t1)] pb-40">

      <Navbar
        hasBooking={false}
        categories={categories}
        onCartClick={() => {}}
        onSelectCategory={(cat) => { window.location.href = `/?category=${cat}#experiences`; }}
      />

      {/* ── Cinematic Hero ── */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden theme-force-dark">
        <div className="absolute inset-0">
          <Image
            src={pkg.image || pkg.heroImage || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2000'}
            alt={pkg.title}
            fill
            className="object-cover scale-[1.02]"
            priority
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2000';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 px-5 sm:px-8 pb-12">
          <div className="max-w-7xl mx-auto space-y-5">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
              <ArrowLeft size={14} /> Back to Experiences
            </button>
            {pkg.badge && (
              <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--g300)] text-black text-[0.55rem] font-black uppercase tracking-widest">{pkg.badge}</span>
            )}
            <h1 className="fd text-4xl md:text-6xl font-light text-white tracking-tight leading-tight">{pkg.title}</h1>
            <p className="text-white/60 max-w-2xl text-sm leading-relaxed">{pkg.subtitle}</p>
            <div className="flex items-center gap-6 text-[0.6rem] uppercase tracking-widest font-black text-white/40">
              <span className="flex items-center gap-1.5"><Calendar size={12} /> {pkg.durationDays || 1} Days / {pkg.durationNights || 0} Nights</span>
              <span className="flex items-center gap-1.5"><Users size={12} /> Up to {pkg.maxGroupSize || pkg.maxGuests} Guests</span>
              <span className="flex items-center gap-1.5"><Shield size={12} /> {pkg.cancellationPolicy?.split('.')[0] || 'Free cancellation'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Inclusions Bar ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 -mt-6 relative z-20">
        <InclusionsBar
          inclusions={pkg.included || pkg.inclusions || []}
          exclusions={pkg.notIncluded || pkg.exclusions || []}
          durationDays={pkg.durationDays || 1}
          durationNights={pkg.durationNights || 0}
        />
      </section>

      {/* ── Itinerary Section ── */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mt-16">
        <div className="flex items-center gap-3 mb-10">
          <div className="gold-line w-12" />
          <span className="text-[0.6rem] tracking-[0.4em] uppercase font-black text-[var(--g300)]">Your Itinerary</span>
        </div>

        <div className="flex gap-10">
          {/* Left: Sticky Day Timeline */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <DayTimeline
              days={(pkg.packageItinerary || pkg.itinerary || []).map((d: any) => ({ dayNumber: d.dayNumber || 1, title: d.title || d.activity }))}
              activeDay={activeDay}
              onDayClick={scrollToDay}
            />
          </div>

          {/* Right: Itinerary Feed */}
          <div className="flex-1 space-y-10">
            {(pkg.packageItinerary || []).map((day: any) => (
              <div
                key={day.dayNumber}
                ref={el => { if (el) dayRefs.current.set(day.dayNumber, el); }}
                data-day={day.dayNumber}
                className="scroll-mt-32"
              >
                {/* Day Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--g300)]/10 border border-[var(--g300)]/20 flex items-center justify-center">
                    <span className="fd text-lg font-bold text-[var(--g300)]">{day.dayNumber}</span>
                  </div>
                  <div>
                    <p className="text-[0.55rem] uppercase tracking-widest font-black text-[var(--g300)]">Day {day.dayNumber}</p>
                    <h3 className="fd text-xl font-medium text-[var(--t1)]">{day.title}</h3>
                  </div>
                </div>

                {day.description && (
                  <p className="text-sm text-[var(--t3)] leading-relaxed mb-6 pl-16">{day.description}</p>
                )}

                {/* Modules */}
                <div className="space-y-4 pl-0 lg:pl-16">
                  {(day.modules || []).map((mod: any) => {
                    if (priceState.removedModules.has(mod.id)) return null;
                    return (
                      <ModuleCard
                        key={mod.id}
                        module={mod}
                        onRemove={mod.isRemovable ? () => handleRemoveModule(mod.id, mod.baseCost) : undefined}
                        onUpgrade={(upgradeId) => {
                          const upgrade = mod.upgrades?.find((u: any) => u.id === upgradeId);
                          if (upgrade) handleUpgrade(mod.id, upgradeId, upgrade.priceDelta);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {(!pkg.packageItinerary || pkg.packageItinerary.length === 0) && (
              <div className="text-center py-20 text-[var(--t3)]">
                <p className="fd text-lg">Itinerary Coming Soon</p>
                <p className="text-sm mt-2">Our concierge team is finalizing the details of this journey.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Sticky Price Bar ── */}
      <PriceBar
        basePrice={pkg.price || pkg.basePrice}
        adjustedPrice={priceState.adjustedPrice}
        onBook={handleBook}
      />

      <div className="h-24" /> {/* spacer for sticky bar */}
      <Footer categories={categories} />
    </main>
  );
}
