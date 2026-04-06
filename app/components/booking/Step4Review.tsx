import { format, addDays } from "date-fns";
import { Row, PromoInput } from "./BookingComponents";
import { BookingState, Activity } from "../../types";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";
import { Calendar, Users, Plane, Hotel, MapPin, Compass, Utensils, Palmtree, ChevronDown, ChevronUp, Clock, Sparkles, Zap } from "lucide-react";
import { useState } from "react";

interface Step4Props {
  booking: BookingState;
  onUpdate: (u: Partial<BookingState>) => void;
  totalPrice: number;
  activities: Activity[];
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  flight: <Plane size={13} />,
  hotel: <Hotel size={13} />,
  transfer: <MapPin size={13} />,
  activity: <Compass size={13} />,
  meal: <Utensils size={13} />,
  leisure: <Palmtree size={13} />,
};

const MODULE_COLORS: Record<string, string> = {
  flight: 'bg-blue-500/10 text-blue-400',
  hotel: 'bg-purple-500/10 text-purple-400',
  transfer: 'bg-cyan-500/10 text-cyan-400',
  activity: 'bg-emerald-500/10 text-emerald-400',
  meal: 'bg-orange-500/10 text-orange-400',
  leisure: 'bg-[var(--g300)]/10 text-[var(--g300)]',
};

export default function Step4Review({ booking, onUpdate, totalPrice, activities }: Step4Props) {
  const { t } = useLanguage();
  const { convert } = useCurrency();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const isPackage = booking.activity?.isPackage || booking.activity?.category === 'signature-journeys';
  const isCombo = booking.activity?.isComboDeal && booking.comboItems && booking.comboItems.length > 0;
  const durationDays = (booking.activity as any)?.durationDays || 1;
  const durationNights = (booking.activity as any)?.durationNights || 0;
  const packageItinerary = (booking.activity as any)?.packageItinerary || [];

  const subtotal = (booking.activity?.price ?? 0) * booking.adults + (typeof booking.activity?.childPrice === 'number' ? booking.activity.childPrice : (booking.activity?.price ?? 0) * 0.5) * booking.children;
  const transportPrice = booking.activity?.transportOptions?.[booking.transportIndex ?? -1]?.price || 0;
  
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-10 pb-4 border-b border-white/5">
        <p className="text-[0.65rem] tracking-[0.22em] uppercase font-semibold mb-1" style={{ color: "var(--g300)" }}>
          ✦ {t('booking.step_04')}
        </p>
        <h3 className="fd text-xl font-medium">
          {isPackage ? 'Verify Your Journey Dossier' : isCombo ? 'Verify Your Combo Bundle' : t('booking.verify_dossier')}
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
           {/* Adventure Identity */}
           <div className="p-6 rounded-[2.5rem] bg-[var(--s1)] border border-[var(--bw1)] space-y-2 shadow-sm">
              <p className="text-[0.6rem] uppercase tracking-widest font-black mb-4" style={{ color: "var(--t3)" }}>{t('booking.adventure_identity')}</p>
              <h4 className="fd text-2xl font-medium tracking-tight h-14 overflow-hidden mask-fade text-[var(--t1)]">{booking.activity?.title}</h4>
              <p className="text-sm text-[var(--g300)] italic font-medium">{booking.activity?.category}</p>
           </div>

           {/* ── COMBO: Per-Activity Schedule Cards ── */}
           {isCombo && booking.comboItems && (
             <div className="space-y-4">
               <div className="flex items-center gap-2 mb-2">
                 <Sparkles size={14} className="text-[var(--g300)]" />
                 <p className="text-[0.6rem] uppercase tracking-[0.25em] font-black text-[var(--g300)]">Experience Schedule</p>
               </div>
               {booking.comboItems.map((item, idx) => {
                 const act = activities.find(a => a.id === item.activityId);
                 return (
                   <div key={idx} className="p-4 rounded-2xl bg-[var(--s1)] border border-[var(--bw1)] shadow-sm">
                     <div className="flex items-center gap-3 mb-3">
                       <div className="w-8 h-8 rounded-lg bg-[var(--g300)]/15 border border-[var(--g300)]/30 flex items-center justify-center flex-shrink-0">
                         <span className="fd text-[0.7rem] font-bold text-[var(--g300)]">{idx + 1}</span>
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-[0.5rem] uppercase tracking-widest font-black text-[var(--g300)]">Experience {idx + 1}</p>
                         <p className="text-[0.82rem] font-medium text-[var(--t1)] truncate">{act?.title || "Adventure"}</p>
                       </div>
                       {act?.duration && (
                         <span className="text-[0.6rem] text-[var(--t3)] flex items-center gap-1 flex-shrink-0">
                           <Clock size={10} /> {act.duration}
                         </span>
                       )}
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                       <div className="px-3 py-2 rounded-xl bg-[var(--bw4)] border border-[var(--bw1)]">
                         <p className="text-[0.5rem] uppercase tracking-widest font-black text-[var(--t3)] mb-0.5">Date</p>
                         <p className="text-[0.78rem] font-bold text-[var(--t1)]">
                           {item.date ? format(new Date(item.date), "dd MMM yyyy") : "-"}
                         </p>
                       </div>
                       <div className="px-3 py-2 rounded-xl bg-[var(--bw4)] border border-[var(--bw1)]">
                         <p className="text-[0.5rem] uppercase tracking-widest font-black text-[var(--t3)] mb-0.5">Time Slot</p>
                         <p className="text-[0.78rem] font-bold text-[var(--g300)]">{item.timeSlot || "-"}</p>
                       </div>
                     </div>
                   </div>
                 );
               })}
               {/* Guest count */}
               <div className="p-4 rounded-2xl bg-[var(--s1)] border border-[var(--bw1)] shadow-sm flex items-center gap-3">
                 <Users size={16} className="text-[var(--g300)]" />
                 <div>
                   <p className="text-[0.5rem] uppercase tracking-widest font-black text-[var(--t3)]">Guests</p>
                   <p className="text-[0.85rem] font-bold text-[var(--t1)]">{booking.adults} Adults{booking.children > 0 ? `, ${booking.children} Children` : ""}</p>
                 </div>
               </div>
             </div>
           )}
           
           {/* Date info cards (non-combo) */}
           {!isCombo && isPackage && booking.date ? (
             /* Package: Date Range + Duration */
             <div className="space-y-4">
               <div className="p-5 rounded-3xl bg-[var(--s1)] border border-[var(--bw1)] shadow-sm">
                 <p className="text-[0.6rem] uppercase tracking-widest font-black mb-3" style={{ color: "var(--t3)" }}>Journey Period</p>
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-[0.9rem] font-bold text-[var(--t1)]">{format(new Date(booking.date), "EEE, MMM d")}</p>
                     <p className="text-[0.6rem] text-[var(--t3)]">Departure</p>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="h-px w-6 bg-[var(--g300)]/30" />
                     <span className="px-3 py-1 rounded-full bg-[var(--g300)]/10 border border-[var(--g300)]/30 text-[0.55rem] font-black uppercase tracking-widest text-[var(--g300)]">
                       {durationDays}D / {durationNights}N
                     </span>
                     <div className="h-px w-6 bg-[var(--g300)]/30" />
                   </div>
                   <div className="text-right">
                     <p className="text-[0.9rem] font-bold text-[var(--t1)]">{format(addDays(new Date(booking.date), durationDays - 1), "EEE, MMM d")}</p>
                     <p className="text-[0.6rem] text-[var(--t3)]">Return</p>
                   </div>
                 </div>
               </div>
               <div className="p-5 rounded-3xl bg-[var(--s1)] border border-[var(--bw1)] shadow-sm">
                  <p className="text-[0.6rem] uppercase tracking-widest font-black mb-1" style={{ color: "var(--t3)" }}>Guests</p>
                  <p className="text-[0.9rem] font-bold text-[var(--t1)] uppercase">{booking.adults} Adults, {booking.children} Children</p>
               </div>
             </div>
           ) : !isCombo ? (
             /* Standard: Single Date + Guests */
             <div className="grid grid-cols-2 gap-4">
               <div className="p-5 rounded-3xl bg-[var(--s1)] border border-[var(--bw1)] shadow-sm">
                  <p className="text-[0.6rem] uppercase tracking-widest font-black mb-1" style={{ color: "var(--t3)" }}>Date</p>
                  <p className="text-[0.9rem] font-bold text-[var(--t1)] uppercase">{booking.date ? format(new Date(booking.date), "dd MMM yyyy") : "-"}</p>
               </div>
               <div className="p-5 rounded-3xl bg-[var(--s1)] border border-[var(--bw1)] shadow-sm">
                  <p className="text-[0.6rem] uppercase tracking-widest font-black mb-1" style={{ color: "var(--t3)" }}>Guests</p>
                  <p className="text-[0.9rem] font-bold text-[var(--t1)] uppercase">{booking.adults} Adults, {booking.children} Children</p>
               </div>
             </div>
           ) : null}

           {/* Package Itinerary Review */}
           {isPackage && booking.date && packageItinerary.length > 0 && (
             <div className="space-y-3">
               <div className="flex items-center gap-2 mb-2">
                 <Calendar size={14} className="text-[var(--g300)]" />
                 <p className="text-[0.6rem] uppercase tracking-[0.25em] font-black text-[var(--g300)]">Day-by-Day Itinerary</p>
               </div>
               
               {packageItinerary.map((day: any, dayIdx: number) => {
                 const dayDate = addDays(new Date(booking.date!), dayIdx);
                 const isExpanded = expandedDay === dayIdx;
                 const moduleCount = day.modules?.length || 0;
                 
                 // Count module types
                 const typeCounts: Record<string, number> = {};
                 (day.modules || []).forEach((m: any) => {
                   typeCounts[m.type] = (typeCounts[m.type] || 0) + 1;
                 });

                 return (
                   <div
                     key={day.dayNumber || dayIdx}
                     className="rounded-2xl border border-[var(--bw1)] bg-[var(--s1)] overflow-hidden transition-all"
                   >
                     {/* Day header - clickable to expand */}
                     <button
                       onClick={() => setExpandedDay(isExpanded ? null : dayIdx)}
                       className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[var(--bw4)] transition-colors"
                     >
                       <div className="w-9 h-9 rounded-xl bg-[var(--g300)]/10 border border-[var(--g300)]/25 flex items-center justify-center flex-shrink-0">
                         <span className="fd text-[0.75rem] font-bold text-[var(--g300)]">{day.dayNumber || dayIdx + 1}</span>
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-[0.5rem] uppercase tracking-widest font-black text-[var(--g300)]">
                           Day {day.dayNumber || dayIdx + 1} · {format(dayDate, "EEE, MMM d")}
                         </p>
                         <p className="text-[0.78rem] font-medium text-[var(--t1)] truncate">
                           {day.title || "Leisure Day"}
                         </p>
                       </div>
                       {/* Module type badges */}
                       <div className="flex items-center gap-1.5 flex-shrink-0">
                         {Object.entries(typeCounts).map(([type, count]) => (
                           <div key={type} className={`w-5 h-5 rounded-md flex items-center justify-center ${MODULE_COLORS[type] || 'bg-white/5 text-[var(--t3)]'}`}>
                             {MODULE_ICONS[type]}
                           </div>
                         ))}
                       </div>
                       <div className="text-[var(--t3)] flex-shrink-0">
                         {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                       </div>
                     </button>

                     {/* Expanded content */}
                     {isExpanded && day.modules && day.modules.length > 0 && (
                       <div className="px-4 pb-4 pt-1 border-t border-[var(--bw1)] space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                         {day.modules.map((mod: any, modIdx: number) => (
                           <div key={mod.id || modIdx} className="flex items-start gap-3 py-2 px-3 rounded-xl bg-[var(--bw4)]">
                             <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${MODULE_COLORS[mod.type] || 'bg-white/5 text-[var(--t3)]'}`}>
                               {MODULE_ICONS[mod.type] || <Compass size={12} />}
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-2">
                                 <span className="text-[0.5rem] uppercase tracking-widest font-black text-[var(--t3)]">{mod.type}</span>
                                 {mod.time && (
                                   <span className="text-[0.5rem] text-[var(--g300)] font-bold">· {mod.time}</span>
                                 )}
                               </div>
                               <p className="text-[0.75rem] font-medium text-[var(--t1)]">{mod.title}</p>
                               {mod.description && (
                                 <p className="text-[0.65rem] text-[var(--t3)] mt-0.5 line-clamp-2">{mod.description}</p>
                               )}
                             </div>
                             {mod.isIncluded && (
                               <span className="text-[0.45rem] uppercase tracking-widest font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex-shrink-0 mt-1">
                                 Included
                               </span>
                             )}
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
           )}
        </div>

        <div className="lg:col-span-5 space-y-6">
           <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[var(--g300)]/10 to-transparent border border-[var(--g300)]/10">
              <p className="text-[0.6rem] uppercase tracking-widest font-black text-[var(--g300)] mb-6 tracking-[0.3em]">{t('booking.final_consideration')}</p>
              <div className="space-y-4 mb-8">
                 {isCombo && booking.comboItems ? (
                   /* ── COMBO PRICE BREAKDOWN ── */
                   <>
                     {booking.comboItems.map((item, idx) => {
                       const act = activities.find(a => a.id === item.activityId);
                       if (!act) return null;
                       const actAdultPrice = act.price;
                       const actChildPrice = typeof act.childPrice === 'number' ? act.childPrice : actAdultPrice * 0.5;
                       const lineTotal = (actAdultPrice * booking.adults) + (actChildPrice * booking.children);
                       return (
                         <Row 
                           key={idx}
                           label={`${act.title} (${booking.adults}A${booking.children > 0 ? `+${booking.children}C` : ''})`} 
                           val={convert(lineTotal)} 
                         />
                       );
                     })}
                     {/* Combo discount line */}
                     {(() => {
                       const originalTotal = booking.activity?.originalPrice 
                         ? (booking.activity.originalPrice * booking.adults + (booking.activity.originalPrice * 0.5) * booking.children)
                         : 0;
                       const comboBaseTotal = booking.comboItems.reduce((sum, item) => {
                         const act = activities.find(a => a.id === item.activityId);
                         if (!act) return sum;
                         const ap = act.price;
                         const cp = typeof act.childPrice === 'number' ? act.childPrice : ap * 0.5;
                         return sum + (ap * booking.adults) + (cp * booking.children);
                       }, 0);
                       const savings = comboBaseTotal - totalPrice;
                       
                       if (savings > 0) {
                         return (
                           <div className="flex justify-between text-[0.8rem] text-emerald-400 font-bold">
                             <span className="flex items-center gap-1.5">
                               <Zap size={12} /> Combo Savings
                             </span>
                             <span>- {convert(Math.round(savings))}</span>
                           </div>
                         );
                       }
                       return null;
                     })()}
                   </>
                 ) : (
                   /* ── STANDARD PRICE BREAKDOWN ── */
                   <>
                     <Row label={isPackage ? 'Package Experience' : t('booking.base_experience')} val={convert(subtotal)} />
                     {transportPrice > 0 && <Row label={t('booking.premium_transport')} val={convert(transportPrice)} />}
                     {booking.promoCode && (
                        <div className="flex justify-between text-[0.8rem] text-emerald-400 font-bold">
                           <span>{t('booking.voucher')} {booking.promoCode.code}</span>
                           <span>- {convert(totalPrice - subtotal - transportPrice < 0 ? Math.abs(totalPrice - subtotal - transportPrice) : 0)}</span>
                        </div>
                     )}
                   </>
                 )}
              </div>
              <div className="h-px bg-white/5 mb-6" />
              <div className="flex items-end justify-between">
                 <div>
                   <p className="text-[0.6rem] uppercase font-black mb-1" style={{ color: "var(--t3)" }}>Total Due</p>
                   <p className="fd text-4xl font-medium gold-text">{convert(totalPrice)}</p>
                 </div>
                 <div className="text-right text-[0.55rem] uppercase tracking-tighter opacity-70" style={{ color: "var(--t4)" }}>Inclusive of VAT</div>
              </div>
           </div>

           <PromoInput 
              booking={booking} 
              onUpdate={onUpdate} 
              subtotal={isCombo ? totalPrice : subtotal + transportPrice}
            />
        </div>
      </div>
    </div>
  );
}

