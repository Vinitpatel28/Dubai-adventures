'use client';

import { Hotel, Plane, Car, Compass, UtensilsCrossed, Palmtree, Check } from 'lucide-react';
import { useCurrency } from '@/app/context/CurrencyContext';

interface InclusionsBarProps {
  inclusions: string[];
  exclusions: string[];
  durationDays: number;
  durationNights: number;
}

const ICON_MAP: Record<string, typeof Hotel> = {
  hotel: Hotel, flight: Plane, transfer: Car, activity: Compass, meal: UtensilsCrossed, leisure: Palmtree,
};

function guessIcon(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes('hotel') || lower.includes('resort') || lower.includes('stay')) return Hotel;
  if (lower.includes('flight') || lower.includes('air')) return Plane;
  if (lower.includes('transfer') || lower.includes('chauffeur') || lower.includes('pickup')) return Car;
  if (lower.includes('meal') || lower.includes('breakfast') || lower.includes('dinner') || lower.includes('lunch')) return UtensilsCrossed;
  if (lower.includes('leisure') || lower.includes('free')) return Palmtree;
  return Compass;
}

export default function InclusionsBar({ inclusions, exclusions, durationDays, durationNights }: InclusionsBarProps) {
  return (
    <div className="glass rounded-[2rem] border border-[var(--bw2)] p-6 shadow-lg">
      {/* Duration + Inclusions row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--g300)] text-black">
          <span className="text-[0.6rem] font-black uppercase tracking-widest">{durationDays} Days / {durationNights} Nights</span>
        </div>
        {inclusions.map((inc, i) => {
          const Icon = guessIcon(inc);
          return (
            <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-[var(--bw2)] bg-[var(--s1)]">
              <Icon size={13} className="text-[var(--g300)]" />
              <span className="text-[0.6rem] font-bold text-[var(--t1)] uppercase tracking-wider">{inc}</span>
            </div>
          );
        })}
      </div>

      {/* Exclusions (collapsed) */}
      {exclusions.length > 0 && (
        <details className="group">
          <summary className="text-[0.55rem] uppercase tracking-widest font-black text-[var(--t3)] cursor-pointer hover:text-[var(--t2)] transition-colors">
            What&apos;s Not Included ▾
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {exclusions.map((exc, i) => (
              <span key={i} className="text-[0.55rem] px-3 py-1.5 rounded-full border border-[var(--bw1)] text-[var(--t3)] font-medium">
                {exc}
              </span>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
