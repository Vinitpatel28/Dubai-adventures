import React, { useState, useEffect } from "react";
import {
  Check, ChevronLeft, ChevronRight, Minus, Plus, Calendar, Clock, Lock, ShieldCheck, Ticket, Car, Bus, Train, Star, MapPin, User, CreditCard, X, Loader2, Smartphone
} from "lucide-react";
import { format, isBefore, startOfDay, isSameDay } from "date-fns";
import { BookingState } from "../../types";
import { useCurrency } from "../../context/CurrencyContext";

/* ─── Visual Credit Card Component ─────────────────────────────────────── */
export function VisualCreditCard({ details }: { details: { name: string; number: string; expiry: string; cvv: string } }) {
  const formattedNumber = (details.number || "••••••••••••••••")
    .replace(/\s/g, "")
    .replace(/(\d{4})/g, "$1 ")
    .trim() || "•••• •••• •••• ••••";

  return (
    <div className="relative w-full max-w-[380px] aspect-[1.586/1] rounded-[1.5rem] overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] animate-in fade-in zoom-in-95 duration-1000 border border-white/5 theme-force-dark">
      <div className="absolute inset-0 bg-[#0A0A0B]" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[70%] bg-[var(--g300)]/5 blur-[80px] rounded-full" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[70%] bg-emerald-500/[0.02] blur-[80px] rounded-full" />

      <div className="relative h-full p-7 lg:p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="w-11 h-8 rounded-md bg-gradient-to-br from-[#ECC86A] via-[#D4962A] to-[#B87620] relative overflow-hidden flex flex-col justify-around py-1 px-1.5 opacity-90 shadow-[0_0_20px_rgba(212,150,42,0.2)] border border-white/10">
            <div className="h-px bg-black/20 w-full" />
            <div className="h-px bg-black/20 w-full" />
            <div className="h-px bg-black/20 w-full" />
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
              <div className="w-[1px] h-full bg-black/20" />
            </div>
          </div>
          <div className="text-right">
            <p className="fd text-[0.7rem] italic font-medium tracking-tight" style={{ color: "var(--g300)" }}>
              Adventures Elite
            </p>
            <p className="text-[0.4rem] font-bold uppercase tracking-[0.3em] mt-1" style={{ color: "var(--t4)" }}>
              Private Member
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-xl lg:text-2xl font-mono tracking-[0.05em] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap overflow-hidden" style={{ color: "var(--t1)" }}>
            {formattedNumber}
          </div>
          <div className="flex justify-between items-end mt-auto">
            <div className="space-y-1 overflow-hidden">
              <span className="text-[0.45rem] uppercase tracking-[0.2em] font-black" style={{ color: "var(--t3)" }}>Card Holder</span>
              <p className="text-[0.7rem] font-black uppercase tracking-[0.15em] truncate" style={{ color: "var(--t2)" }}>
                {details.name || "Traveller Full Name"}
              </p>
            </div>
            <div className="space-y-1 text-right flex-shrink-0">
              <span className="text-[0.45rem] uppercase tracking-[0.2em] font-black" style={{ color: "var(--t3)" }}>Expires</span>
              <p className="text-[0.7rem] font-black tracking-widest" style={{ color: "var(--t2)" }}>
                {details.expiry || "MM/YY"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
      <div className="absolute inset-0 border border-white/10 rounded-[1.5rem] pointer-events-none" />
    </div>
  );
}

export function MiniCalendar({
  selected,
  onSelect,
  basePrice = 0,
  pricingRules = [],
  globalOps = null,
  activityId = "",
  packageDurationDays = 0,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
  basePrice?: number;
  pricingRules?: any[];
  globalOps?: any;
  activityId?: string;
  packageDurationDays?: number;
}) {
  const { convert } = useCurrency();
  const [view, setView] = useState(new Date());

  const today = startOfDay(new Date());
  const yr = view.getFullYear(), mo = view.getMonth();
  const firstDay = new Date(yr, mo, 1).getDay();
  const daysInMo = new Date(yr, mo + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMo }, (_, i) => i + 1)];

  const isRangeMode = packageDurationDays > 0;

  // Calculate range dates when in range mode
  const getPackageEndDate = (start: Date) => {
    const end = new Date(start);
    end.setDate(end.getDate() + packageDurationDays - 1);
    return end;
  };

  const isDis = (d: number) => isBefore(new Date(yr, mo, d), today);
  const isSel = (d: number) => !!selected && selected.getFullYear() === yr && selected.getMonth() === mo && selected.getDate() === d;
  const isTod = (d: number) => today.getFullYear() === yr && today.getMonth() === mo && today.getDate() === d;

  // Range mode helpers
  const isInRange = (d: number): boolean => {
    if (!isRangeMode || !selected) return false;
    const cellDate = new Date(yr, mo, d);
    const endDate = getPackageEndDate(selected);
    return cellDate >= startOfDay(selected) && cellDate <= startOfDay(endDate);
  };

  const isRangeStart = (d: number): boolean => {
    if (!isRangeMode || !selected) return false;
    return isSameDay(new Date(yr, mo, d), selected);
  };

  const isRangeEnd = (d: number): boolean => {
    if (!isRangeMode || !selected) return false;
    const endDate = getPackageEndDate(selected);
    return isSameDay(new Date(yr, mo, d), endDate);
  };

  const getDayLabel = (d: number): string | null => {
    if (!isRangeMode || !selected) return null;
    const cellDate = new Date(yr, mo, d);
    const startDate = startOfDay(selected);
    if (cellDate < startDate) return null;
    const endDate = getPackageEndDate(selected);
    if (cellDate > endDate) return null;
    const dayNum = Math.round((cellDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return `D${dayNum + 1}`;
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--bw4)", border: "1px solid var(--bw2)" }}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setView(new Date(yr, mo - 1, 1))} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--t3)" }}>
          <ChevronLeft size={16} />
        </button>
        <span className="fd text-[0.92rem] font-medium">{format(view, "MMMM yyyy")}</span>
        <button onClick={() => setView(new Date(yr, mo + 1, 1))} className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--t3)" }}>
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-[0.6rem] uppercase tracking-wider py-1 opacity-80" style={{ color: "var(--t3)" }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="min-h-[3.8rem] w-full flex items-center justify-center p-0.5" />;
          let p = basePrice;
          let isPeak = false;
          let isBlackout = false;
          const cellDate = new Date(yr, mo, d);
          if (globalOps?.blackoutDates) {
            const bRule = globalOps.blackoutDates.find((r: any) => r.isActive && r.applyToAll && r.date && isSameDay(new Date(r.date), cellDate));
            if (bRule) isBlackout = true;
          }
          if (!isBlackout) {
            if (pricingRules && pricingRules.length > 0) {
              const rule = pricingRules.find((r: any) => {
                if (r.type === 'date' && r.date) return isSameDay(new Date(r.date), cellDate);
                if (r.type === 'weekend') return cellDate.getDay() === 0 || cellDate.getDay() === 6;
                return false;
              });
              if (rule) { p += rule.adjustment; isPeak = true; }
            }
            if (globalOps?.pricingRules && globalOps.pricingRules.length > 0) {
              const gRule = globalOps.pricingRules.find((r: any) => {
                if (!r.isActive) return false;
                if (!r.applyToAll && !r.targetActivityIds?.includes(activityId)) return false;
                if (r.type === 'date' && r.date) return isSameDay(new Date(r.date), cellDate);
                if (r.type === 'weekend') return cellDate.getDay() === 0 || cellDate.getDay() === 6;
                if (r.type === 'fixed_holiday' && r.date) {
                  const [m, date] = r.date.split('-');
                  return (cellDate.getMonth() + 1) === parseInt(m) && cellDate.getDate() === parseInt(date);
                }
                return false;
              });
              if (gRule) {
                if (gRule.adjustmentType === 'fixed') p += gRule.adjustment;
                else p += (basePrice * (gRule.adjustment / 100));
                isPeak = true;
              }
            }
          }
          const disabled = isDis(d) || isBlackout;

          // Range mode styling
          const inRange = isInRange(d);
          const rangeStart = isRangeStart(d);
          const rangeEnd = isRangeEnd(d);
          const dayLabel = getDayLabel(d);

          return (
            <div key={i} className="min-h-[3.8rem] w-full flex items-center justify-center p-0.5 relative group">
              {/* Range band background */}
              {inRange && !rangeStart && !rangeEnd && (
                <div className="absolute inset-y-1 inset-x-0 bg-[var(--g300)]/8 pointer-events-none" />
              )}
              {rangeStart && (
                <div className="absolute inset-y-1 left-1/2 right-0 bg-[var(--g300)]/8 pointer-events-none rounded-l-xl" />
              )}
              {rangeEnd && (
                <div className="absolute inset-y-1 left-0 right-1/2 bg-[var(--g300)]/8 pointer-events-none rounded-r-xl" />
              )}
              <button
                disabled={disabled}
                onClick={() => !disabled && onSelect(new Date(yr, mo, d))}
                className="w-full h-full rounded-xl flex flex-col items-center justify-center transition-all duration-200 border relative z-10"
                style={
                  rangeStart
                    ? { background: "var(--g300)", color: "#05030A", borderColor: "var(--g300)" }
                    : rangeEnd
                      ? { background: "rgba(212,150,42,0.25)", color: "var(--g200)", borderColor: "var(--g300)", border: "2px solid var(--g300)" }
                      : inRange
                        ? { background: "rgba(212,150,42,0.12)", color: "var(--g200)", borderColor: "rgba(212,150,42,0.3)" }
                        : isSel(d)
                          ? { background: "var(--g300)", color: "#05030A", borderColor: "var(--g300)" }
                          : isBlackout
                            ? { background: "rgba(239,68,68,0.08)", color: "#7F1D1D", borderColor: "rgba(239,68,68,0.2)", cursor: "not-allowed" }
                            : isPeak
                              ? { background: "rgba(212,150,42,0.12)", color: "var(--t1)", borderColor: "rgba(212,150,42,0.3)" }
                              : isTod(d)
                                ? { color: "var(--g200)", border: "1px solid var(--g300)" }
                                : isDis(d)
                                  ? { color: "var(--t4)", cursor: "not-allowed", borderColor: "transparent" }
                                  : { color: "var(--t1)", borderColor: "var(--bw2)", background: "var(--s1)" }
                }
              >
                <span className="text-[0.8rem] font-bold leading-none mt-0.5">{d}</span>
                {/* Day label for range mode */}
                {dayLabel && (
                  <span className="text-[0.4rem] font-black uppercase tracking-widest mt-0.5"
                    style={{ color: rangeStart ? "rgba(0,0,0,0.5)" : "var(--g300)" }}>
                    {dayLabel}
                  </span>
                )}
                {/* Price label (non-range mode only) */}
                {!isRangeMode && (!disabled && basePrice > 0) ? (
                  <span className="text-[0.45rem] font-black uppercase tracking-widest mt-1 opacity-70"
                    style={{ color: isSel(d) ? "rgba(0,0,0,0.6)" : isPeak ? "var(--g300)" : "var(--t4)" }}>
                    {convert(p)}
                  </span>
                ) : isBlackout ? (
                  <span className="text-[0.45rem] font-black uppercase tracking-widest mt-1 text-red-500/40">Closed</span>
                ) : null}
              </button>
            </div>
          );
        })}
      </div>
      {/* Range mode legend */}
      {isRangeMode && selected && (
        <div className="mt-4 pt-3 border-t border-[var(--bw1)] flex items-center justify-between text-[0.6rem]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[var(--g300)]" />
            <span style={{ color: "var(--t3)" }}>Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-[var(--g300)]/20 border border-[var(--g300)]/50" />
            <span style={{ color: "var(--t3)" }}>Journey</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm border-2 border-[var(--g300)] bg-[var(--g300)]/25" />
            <span style={{ color: "var(--t3)" }}>Return</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function GuestRow({ label, sub, value, min, max, onChange }: {
  label: string; sub: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 rounded-2xl" style={{ background: "var(--s1)", border: "1px solid var(--bw1)" }}>
      <div>
        <p className="text-[0.9rem] font-medium" style={{ color: "var(--t1)" }}>{label}</p>
        <p className="text-[0.72rem] mt-0.5" style={{ color: "var(--t3)" }}>{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-25" style={{ background: "var(--bw1)", border: "1px solid var(--bw2)", color: "var(--t2)" }}>
          <Minus size={14} />
        </button>
        <span className="w-8 text-center font-semibold text-[1.05rem]" style={{ color: "var(--t1)" }}>{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-25" style={{ background: "rgba(212,150,42,0.18)", border: "1px solid var(--bg2)", color: "var(--g200)" }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export function FormField({ label, icon, type, placeholder, value, error, onChange }: {
  label: string; icon: React.ReactNode; type: string; placeholder: string;
  value: string; error?: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <label className="flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] font-black pl-1" style={{ color: "var(--t2)" }}>
        <span style={{ color: "var(--g300)" }}>{icon}</span>
        {label}
      </label>
      <input 
        className={`w-full bg-[var(--bw1)] border transition-all duration-300 rounded-full px-6 py-4 text-sm font-medium text-[var(--t1)] placeholder:text-[var(--t4)] focus:outline-none focus:ring-1 focus:ring-[var(--g300)]/30 ${error ? "border-red-500/50 bg-red-500/5" : "border-[var(--bw2)] hover:border-[var(--bw3)] focus:border-[var(--g300)]"}`} 
        type={type} 
        placeholder={placeholder} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
      {error && <p className="text-[0.68rem] mt-2 flex items-center gap-1.5 pl-4 font-bold animate-in fade-in slide-in-from-top-1" style={{ color: "#F87171" }}><X size={12} /> {error}</p>}
    </div>
  );
}

export function Row({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex items-center justify-between text-[0.8rem]">
      <span style={{ color: "var(--t3)" }}>{label}</span>
      <span style={{ color: "var(--t2)" }}>{val}</span>
    </div>
  );
}

export function PromoInput({ booking, onUpdate, subtotal }: {
  booking: BookingState;
  onUpdate: (u: Partial<BookingState>) => void;
  subtotal: number;
}) {
  const { convert } = useCurrency();
  const [promoInput, setPromoInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [availablePromos, setAvailablePromos] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/promos').then(res => res.json()).then(data => setAvailablePromos(data.promos || [])).catch(() => { });
  }, []);

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, cartTotal: subtotal, totalGuests: booking.adults + booking.children, activityId: booking.activity?.id, activityCategory: booking.activity?.category }),
      });
      const data = await res.json();
      if (res.ok) {
        onUpdate({ promoCode: { code: promoInput.toUpperCase(), discountType: data.discountType, discountValue: data.discountValue, minBookingValue: data.minBookingValue, minGuests: data.minGuests } });
        setPromoInput("");
      } else { setError(data.message || "Invalid code"); }
    } catch { setError("Network error. Try again."); } finally { setLoading(false); }
  };

  const validPromos = availablePromos.filter(p => {
    if (p.appliesTo === 'all') return true;
    if (p.appliesTo === 'category') return p.categories.includes(booking.activity?.category);
    if (p.appliesTo === 'specific') return p.activities.includes(booking.activity?.id);
    return false;
  });

  if (booking.promoCode) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400"><Ticket size={16} /></div>
          <div><p className="text-[0.6rem] uppercase tracking-widest font-bold text-emerald-400/60">Applied Voucher</p><p className="text-sm font-bold text-emerald-400">{booking.promoCode.code}</p></div>
        </div>
        <button onClick={() => onUpdate({ promoCode: null })} className="text-[0.65rem] uppercase tracking-widest font-bold text-white/30 hover:text-white transition-colors">Remove</button>
      </div>
    );
  }

  return (
    <div className="max-w-sm">
      {validPromos.length > 0 && (
        <div className="mb-6">
          <label className="block text-[0.6rem] uppercase tracking-widest font-black text-emerald-400/60 mb-3">Available Offers For This Adventure</label>
          <div className="flex flex-wrap gap-2">
            {validPromos.map(p => (
              <button key={p._id} onClick={() => { setPromoInput(p.code); setError(""); }} className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all text-left">
                <div className="text-[0.65rem] font-bold text-white tracking-widest uppercase">{p.code}</div>
                <div className="text-[0.6rem] text-emerald-400 font-bold">{p.discountType === 'percentage' ? `${p.discountValue}%` : convert(p.discountValue)} OFF</div>
              </button>
            ))}
          </div>
        </div>
      )}
      <label className="block text-[0.65rem] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: "var(--t3)" }}>Have a Promo Code?</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input type="text" placeholder="Enter code" className={`w-full bg-[var(--s1)] border ${error ? 'border-red-500/50' : 'border-[var(--bw1)]'} rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--g300)] transition-all uppercase tracking-widest font-mono text-[var(--t1)] placeholder:text-[var(--t3)]`} value={promoInput} onChange={e => { setPromoInput(e.target.value); setError(""); }} />
          {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 size={16} className="animate-spin text-[var(--t3)]" /></div>}
        </div>
        <button onClick={applyPromo} disabled={loading || !promoInput.trim()} className="px-6 py-3 rounded-xl bg-[var(--s1)] border border-[var(--bw1)] text-[0.7rem] uppercase tracking-widest font-bold text-[var(--t1)] hover:bg-[var(--s2)] transition-all disabled:opacity-30">Apply</button>
      </div>
      {error && <p className="text-[0.7rem] text-red-400 mt-2 flex items-center gap-1.5"><X size={12} /> {error}</p>}
    </div>
  );
}

export function TransportSelector({ options, selected, onSelect }: { options: any[], selected?: number, onSelect: (i: number) => void }) {
  const { convert } = useCurrency();
  if (!options || options.length === 0) return (
    <div className="mt-6 p-8 rounded-2xl bg-[var(--s1)] border border-[var(--bw1)] flex flex-col items-center justify-center text-center gap-3">
      <Car size={32} className="text-[var(--t4)]" /><p className="text-[0.7rem] uppercase tracking-[0.2em] font-black text-[var(--t3)]">Transportation included in base package</p>
    </div>
  );
   return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6"><div className="w-8 h-8 rounded-lg bg-[var(--g300)]/10 flex items-center justify-center text-[var(--g300)]"><Car size={16} /></div><p className="text-[0.65rem] uppercase tracking-[0.25em] font-black" style={{ color: "var(--t3)" }}>Premium Transportation</p></div>
      <div className="grid grid-cols-1 gap-3">
        {options.map((opt, i) => {
          const Icon = { Car, Bus, Train, Star, MapPin }[opt.vehicleIcon as string] || Car;
          return (
            <button key={i} onClick={() => onSelect(i)} className={`p-5 rounded-2xl flex items-center justify-between transition-all relative overflow-hidden group ${selected === i ? 'bg-[var(--g300)]/10 border-2 border-[var(--g300)]' : 'bg-[var(--s1)] border border-[var(--bw1)] hover:bg-[var(--s2)]'}`}>
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${selected === i ? 'bg-[var(--g300)] text-black' : 'bg-[var(--bw2)] text-[var(--t3)]'}`}><Icon size={22} /></div>
                <div className="text-left"><p className={`text-sm font-black uppercase tracking-widest ${selected === i ? 'text-[var(--g300)]' : 'text-[var(--t1)]'}`}>{opt.label}</p><p className="text-[0.6rem] font-bold uppercase tracking-widest mt-1" style={{ color: "var(--t3)" }}>{opt.isPerPerson ? 'Standard Per Person' : 'VIP Private Transfer'}</p></div>
              </div>
              <div className="text-right"><p className="text-sm font-black text-[var(--t1)]">+ {convert(opt.price)}</p><p className="text-[0.55rem] uppercase font-bold" style={{ color: "var(--t3)" }}>Additional</p></div>
              {selected === i && <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[var(--g300)]/5 to-transparent pointer-events-none" />}
            </button>
          );
        })}
      </div>
    </div>
  )
}
