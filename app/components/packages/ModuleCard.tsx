'use client';

import Image from 'next/image';
import { Hotel, Plane, Car, Compass, UtensilsCrossed, Palmtree, Clock, MapPin, Star, ChevronRight } from 'lucide-react';
import { useCurrency } from '@/app/context/CurrencyContext';

interface ModuleProps {
  module: {
    id: string;
    type: string;
    title: string;
    description: string;
    image?: string;
    time?: string;
    duration?: string;
    baseCost: number;
    isIncluded: boolean;
    isRemovable: boolean;
    metadata?: Record<string, string>;
    upgrades?: { id: string; title: string; priceDelta: number; image?: string }[];
  };
  onRemove?: () => void;
  onUpgrade?: (upgradeId: string) => void;
}

const TYPE_CONFIG: Record<string, { icon: typeof Hotel; label: string; accent: string }> = {
  hotel:    { icon: Hotel, label: 'Accommodation', accent: 'from-blue-500/20 to-blue-600/5' },
  flight:   { icon: Plane, label: 'Flight', accent: 'from-sky-500/20 to-sky-600/5' },
  transfer: { icon: Car, label: 'Transfer', accent: 'from-emerald-500/20 to-emerald-600/5' },
  activity: { icon: Compass, label: 'Experience', accent: 'from-[var(--g300)]/20 to-[var(--g400)]/5' },
  meal:     { icon: UtensilsCrossed, label: 'Dining', accent: 'from-orange-500/20 to-orange-600/5' },
  leisure:  { icon: Palmtree, label: 'Leisure Time', accent: 'from-teal-500/20 to-teal-600/5' },
};

export default function ModuleCard({ module, onRemove, onUpgrade }: ModuleProps) {
  const { convert } = useCurrency();
  const config = TYPE_CONFIG[module.type] || TYPE_CONFIG.activity;
  const Icon = config.icon;

  return (
    <div className="glass rounded-2xl border border-[var(--bw2)] overflow-hidden hover:border-[var(--g300)]/20 transition-all duration-500 group">
      <div className="flex flex-col sm:flex-row">
        {/* Image (left side) */}
        {module.image && (
          <div className="relative w-full sm:w-44 h-36 sm:h-auto flex-shrink-0 overflow-hidden">
            <Image
              src={module.image}
              alt={module.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=400';
              }}
            />
          </div>
        )}

        {/* Content (right side) */}
        <div className="flex-1 p-5 space-y-3">
          {/* Type badge + time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.accent} flex items-center justify-center`}>
                <Icon size={14} className="text-[var(--t1)]" />
              </div>
              <span className="text-[0.55rem] uppercase tracking-widest font-black text-[var(--t3)]">{config.label}</span>
            </div>
            {module.time && (
              <div className="flex items-center gap-1.5 text-[0.6rem] text-[var(--t2)] font-medium">
                <Clock size={11} className="text-[var(--g300)]" />
                {module.time}
              </div>
            )}
          </div>

          {/* Title + description */}
          <div>
            <h4 className="fd text-base font-medium text-[var(--t1)] tracking-wide">{module.title}</h4>
            {module.description && (
              <p className="text-xs text-[var(--t3)] mt-1 leading-relaxed line-clamp-2">{module.description}</p>
            )}
          </div>

          {/* Meta row (stars, duration, etc.) */}
          <div className="flex items-center gap-4 flex-wrap">
            {module.duration && (
              <span className="text-[0.55rem] text-[var(--t2)] font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock size={10} /> {module.duration}
              </span>
            )}
            {module.metadata?.stars && (
              <span className="flex items-center gap-1 text-[var(--g300)]">
                {Array.from({ length: Number(module.metadata.stars) }).map((_, i) => (
                  <Star key={i} size={10} fill="currentColor" />
                ))}
              </span>
            )}
            {module.metadata?.roomType && (
              <span className="text-[0.55rem] text-[var(--t2)] font-medium">{module.metadata.roomType}</span>
            )}
            {module.isIncluded && (
              <span className="text-[0.5rem] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-black uppercase tracking-wider border border-emerald-500/20">Included</span>
            )}
          </div>

          {/* Upgrades / Remove actions */}
          {(module.upgrades && module.upgrades.length > 0 || module.isRemovable) && (
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--bw1)]">
              {module.upgrades?.map(up => (
                <button key={up.id} onClick={() => onUpgrade?.(up.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--g300)]/20 text-[var(--g300)] text-[0.55rem] font-bold uppercase tracking-wider hover:bg-[var(--g300)]/10 transition-all">
                  <ChevronRight size={10} />
                  {up.title} ({up.priceDelta > 0 ? '+' : ''}{convert(up.priceDelta)})
                </button>
              ))}
              {module.isRemovable && (
                <button onClick={onRemove}
                  className="ml-auto text-[0.55rem] text-red-400/50 font-bold uppercase tracking-wider hover:text-red-400 transition-colors">
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
