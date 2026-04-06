'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Users, Star, ArrowRight } from 'lucide-react';
import { useCurrency } from '@/app/context/CurrencyContext';

interface PackageCardProps {
  pkg: {
    _id: string;
    title: string;
    subtitle: string;
    heroImage: string;
    basePrice: number;
    durationDays: number;
    durationNights: number;
    inclusions: string[];
    badge?: string;
    badgeType?: string;
    maxGuests: number;
  };
}

export default function PackageCard({ pkg }: PackageCardProps) {
  const { convert } = useCurrency();

  return (
    <Link href={`/packages/${pkg._id}`} className="group block">
      <div className="rounded-[2rem] overflow-hidden border border-[var(--bw2)] bg-[var(--s1)] shadow-lg hover:shadow-[var(--shg)] hover:border-[var(--g300)]/30 transition-all duration-700 hover:-translate-y-2">
        {/* Image */}
        <div className="relative h-64 overflow-hidden">
          <Image
            src={pkg.heroImage || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200'}
            alt={pkg.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--s1)] via-transparent to-transparent opacity-80" />

          {/* Badge */}
          {pkg.badge && (
            <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-[var(--g300)] text-black text-[0.55rem] font-black uppercase tracking-widest shadow-lg">
              {pkg.badge}
            </div>
          )}

          {/* Duration pill */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full glass border border-[var(--bw2)] backdrop-blur-xl">
            <Calendar size={12} className="text-[var(--g300)]" />
            <span className="text-[0.65rem] font-black text-[var(--t1)] uppercase tracking-wider">{pkg.durationDays}D / {pkg.durationNights}N</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="fd text-xl font-medium text-[var(--t1)] tracking-wide group-hover:text-[var(--g300)] transition-colors">{pkg.title}</h3>
            <p className="text-xs text-[var(--t3)] mt-2 line-clamp-2 leading-relaxed">{pkg.subtitle}</p>
          </div>

          {/* Inclusions pills */}
          <div className="flex flex-wrap gap-2">
            {pkg.inclusions.slice(0, 4).map((inc, i) => (
              <span key={i} className="text-[0.55rem] px-3 py-1.5 rounded-full bg-[var(--g300)]/10 text-[var(--g300)] font-bold uppercase tracking-wider border border-[var(--g300)]/15">
                {inc}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--bw1)]">
            <div>
              <p className="text-[0.55rem] text-[var(--t3)] uppercase tracking-widest font-black">Starting from</p>
              <p className="fd text-xl font-bold text-[var(--g300)]">{convert(pkg.basePrice)}</p>
            </div>
            <div className="flex items-center gap-2 text-[var(--t2)] group-hover:text-[var(--g300)] transition-colors">
              <span className="text-[0.6rem] font-bold uppercase tracking-widest">View Journey</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
