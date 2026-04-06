'use client';

import { useCurrency } from '@/app/context/CurrencyContext';

interface PriceBarProps {
  basePrice: number;
  adjustedPrice: number;
  onBook: () => void;
}

export default function PriceBar({ basePrice, adjustedPrice, onBook }: PriceBarProps) {
  const { convert } = useCurrency();
  const hasDiscount = adjustedPrice !== basePrice;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-[var(--bw2)] backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
        {/* Price info */}
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[0.55rem] text-[var(--t3)] uppercase tracking-widest font-black">
              {hasDiscount ? 'Customized Total' : 'Package Total'}
            </p>
            <div className="flex items-center gap-3">
              <p className="fd text-2xl font-bold text-[var(--g300)]">{convert(adjustedPrice)}</p>
              {hasDiscount && (
                <p className="text-sm text-[var(--t3)] line-through">{convert(basePrice)}</p>
              )}
            </div>
          </div>
          <div className="hidden md:block text-[0.55rem] text-[var(--t3)] border-l border-[var(--bw1)] pl-6 space-y-0.5">
            <p>Per person · Taxes included</p>
            <p className="text-[var(--g300)]">Pay 20% deposit to reserve</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBook}
            className="btn-g px-8 py-4 rounded-full text-[0.65rem] shadow-[0_0_30px_rgba(212,150,42,0.25)] hover:scale-105 transition-all"
          >
            Reserve This Journey
          </button>
        </div>
      </div>
    </div>
  );
}
