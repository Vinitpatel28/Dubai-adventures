import React from "react";
import { Users, Info } from "lucide-react";
import { GuestRow, TransportSelector } from "./BookingComponents";
import { BookingState } from "../../types";
import { useLanguage } from "../../context/LanguageContext";

interface Step2Props {
  booking: BookingState;
  onUpdate: (u: Partial<BookingState>) => void;
}

export default function Step2Guests({ booking, onUpdate }: Step2Props) {
  const { t } = useLanguage();
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 pb-4 border-b border-white/5">
        <p className="text-[0.65rem] tracking-[0.22em] uppercase font-semibold mb-1" style={{ color: "var(--g300)" }}>
          ✦ {t('booking.step_02')}
        </p>
        <h3 className="fd text-xl font-medium">{t('booking.add_participants')}</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12 xl:col-span-6 space-y-4">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[var(--g300)]/10 flex items-center justify-center text-[var(--g300)]">
                 <Users size={16} />
              </div>
               <p className="text-[0.65rem] uppercase tracking-[0.25em] font-black" style={{ color: "var(--t3)" }}>Select Group Size</p>
            </div>
           
           <GuestRow
            label="Adults"
            sub="Age 12+"
            value={booking.adults}
            min={1}
            max={50}
            onChange={(v) => onUpdate({ adults: v })}
          />
          <GuestRow
            label="Children"
            sub="Age 3 - 11"
            value={booking.children}
            min={0}
            max={50}
            onChange={(v) => onUpdate({ children: v })}
          />

          <div className="mt-8 p-6 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
             <Info size={18} className="text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[0.6rem] uppercase tracking-widest font-black text-amber-600/90 dark:text-amber-400">Child Policy</p>
                <p className="text-[0.7rem] text-[var(--t2)] leading-relaxed font-medium opacity-80">
                   Infants under 3 years are complimentary on most desert safaris. Please mention in the notes if you are travelling with infants.
                </p>
              </div>
          </div>
        </div>

        <div className="lg:col-span-12 xl:col-span-6">
           <TransportSelector 
              options={booking.activity?.transportOptions || []} 
              selected={booking.transportIndex}
              onSelect={(i) => onUpdate({ transportIndex: i })}
            />
        </div>
      </div>
    </div>
  );
}
