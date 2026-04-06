import React from "react";
import Image from "next/image";
import { Calendar, Clock, Tag, Check, Plane, Hotel, MapPin, Utensils, Compass, Palmtree, ArrowRight } from "lucide-react";
import { isSameDay, startOfDay, format, addDays } from "date-fns";
import { MiniCalendar } from "./BookingComponents";
import { timeToMins, parseDuration } from "./BookingUtils";
import { BookingState, Activity } from "../../types";
import { useLanguage } from "../../context/LanguageContext";

interface Step1Props {
  booking: BookingState;
  onUpdate: (u: Partial<BookingState>) => void;
  activeComboIndex: number;
  setActiveComboIndex: (i: number) => void;
  globalOps: any;
  activities: Activity[];
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  flight: <Plane size={14} />,
  hotel: <Hotel size={14} />,
  transfer: <MapPin size={14} />,
  activity: <Compass size={14} />,
  meal: <Utensils size={14} />,
  leisure: <Palmtree size={14} />,
};

export default function Step1Schedule({ booking, onUpdate, activeComboIndex, setActiveComboIndex, globalOps, activities }: Step1Props) {
  const { t } = useLanguage();
  const isPackage = booking.activity?.isPackage || booking.activity?.category === 'signature-journeys';
  const durationDays = (booking.activity as any)?.durationDays || 1;
  const durationNights = (booking.activity as any)?.durationNights || 0;
  const packageItinerary = (booking.activity as any)?.packageItinerary || [];

  // Calculate end date for packages
  const getEndDate = (startDate: Date) => addDays(startDate, durationDays - 1);

  // Generate all package dates
  const getPackageDates = (startDate: Date): Date[] => {
    return Array.from({ length: durationDays }, (_, i) => addDays(startDate, i));
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-6">
        <div>
          <p className="text-[0.65rem] tracking-[0.22em] uppercase font-semibold mb-1" style={{ color: "var(--g300)" }}>
            ✦ {t('booking.step_01')}
          </p>
          <h3 className="fd text-xl font-medium">
            {isPackage ? 'Select Your Journey Dates' : t('booking.create_schedule')}
          </h3>
        </div>

        {/* Combo tabs (non-package only) */}
        {!isPackage && booking.comboItems && booking.comboItems.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {booking.comboItems.map((item, idx) => {
              const isSelected = activeComboIndex === idx;
              const isComplete = !!item.date && !!item.timeSlot;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveComboIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-[0.68rem] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${isSelected
                      ? "bg-[var(--g300)] text-[#06040A] scale-105 shadow-[var(--shg)]"
                      : "bg-white/5 text-white/40 hover:bg-white/10"
                    }`}
                >
                  {isComplete && <Check size={12} />}
                  Exp {idx + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Package duration badge */}
      {isPackage && (
        <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-[var(--g300)]/10 via-[var(--g300)]/5 to-transparent border border-[var(--g300)]/15">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border border-[var(--g300)]/30 relative">
              <Image
                src={booking.activity?.image || "/images/hero_bg_4k_1772860004560.png"}
                fill
                className="object-cover"
                alt="Package"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[0.55rem] uppercase tracking-[0.3em] text-[var(--g300)] font-black mb-1">
                ✦ Signature Journey
              </p>
              <h4 className="fd text-lg font-medium text-[var(--t1)] truncate">
                {booking.activity?.title}
              </h4>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-center px-4 py-2 rounded-xl bg-[var(--g300)]/10 border border-[var(--g300)]/20">
                <p className="fd text-xl font-bold text-[var(--g300)]">{durationDays}</p>
                <p className="text-[0.5rem] uppercase tracking-widest text-[var(--t3)] font-black">Days</p>
              </div>
              <div className="text-center px-4 py-2 rounded-xl bg-[var(--g300)]/10 border border-[var(--g300)]/20">
                <p className="fd text-xl font-bold text-[var(--g300)]">{durationNights}</p>
                <p className="text-[0.5rem] uppercase tracking-widest text-[var(--t3)] font-black">Nights</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Non-package combo scheduling banner */}
      {!isPackage && booking.comboItems && booking.comboItems.length > 0 && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-[var(--g300)]/10 to-transparent border border-[var(--g300)]/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative">
              <Image
                src={booking.activity?.image || "/images/hero_bg_4k_1772860004560.png"}
                fill
                className="object-cover"
                alt="Activity"
              />
            </div>
            <div>
              <p className="text-[0.6rem] uppercase tracking-widest text-[#D4962A] font-black mb-0.5">Currently Scheduling</p>
              <h4 className="fd text-lg font-medium text-white italic">
                {(() => {
                  const comboActId = booking.comboItems?.[activeComboIndex]?.activityId;
                  const comboAct = comboActId ? activities.find(a => a.id === comboActId) : null;
                  return comboAct?.title || booking.activity?.subtitle?.split(" + ")[activeComboIndex] || "Next Adventure";
                })()}
              </h4>
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${isPackage ? 'lg:grid-cols-2' : 'md:grid-cols-2'} gap-8 lg:gap-12`}>
        {/* Calendar */}
        <div>
          <p className="text-[0.7rem] tracking-wider uppercase mb-4 flex items-center gap-2" style={{ color: "var(--t3)" }}>
            <Calendar size={12} style={{ color: "var(--g300)" }} />
            {isPackage ? 'Choose Departure Date' : t('booking.choose_date')}
          </p>

          {/* Pricing rule banner (non-package) */}
          {!isPackage && booking.date && (
            <>
              {(() => {
                const selDate = startOfDay(new Date(booking.date!));
                const actRule = booking.activity?.pricingRules?.find(r => {
                  if (r.type === 'date' && r.date) return isSameDay(new Date(r.date), selDate);
                  if (r.type === 'weekend') return selDate.getDay() === 0 || selDate.getDay() === 6;
                  return false;
                });
                const gRule = globalOps?.pricingRules?.find((r: any) => {
                  if (!r.isActive) return false;
                  if (!r.applyToAll && !r.targetActivityIds?.includes(booking.activity!.id)) return false;
                  if (r.type === 'date' && r.date) return isSameDay(new Date(r.date), selDate);
                  if (r.type === 'weekend') return selDate.getDay() === 0 || selDate.getDay() === 6;
                  if (r.type === 'fixed_holiday' && r.date) {
                    const [m, d] = r.date.split('-');
                    return (selDate.getMonth() + 1) === parseInt(m) && selDate.getDate() === parseInt(d);
                  }
                  return false;
                });
                if (!actRule && !gRule) return null;
                return (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-[var(--g300)]/10 border border-[var(--g300)]/20 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <Tag size={14} className="text-[var(--g300)]" />
                    <div>
                      <p className="text-[0.6rem] font-black text-[var(--g300)] uppercase tracking-widest">
                        {gRule?.label || actRule?.label || t('booking.peak_pricing')}
                      </p>
                      <p className="text-[0.65rem] text-white/60">
                        {gRule ? t('booking.seasonal_markup') : t('booking.seasonal_markup')}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          <MiniCalendar
            selected={booking.comboItems ? booking.comboItems[activeComboIndex].date : booking.date}
            onSelect={(d) => {
              if (isPackage) {
                const endDate = getEndDate(d);
                const pkgDates = getPackageDates(d);
                onUpdate({
                  date: d,
                  timeSlot: "Package Start",
                  packageStartDate: d,
                  packageEndDate: endDate,
                  packageDates: pkgDates,
                });
              } else if (booking.comboItems) {
                const newCombo = [...booking.comboItems];
                newCombo[activeComboIndex].date = d;
                newCombo[activeComboIndex].timeSlot = "";
                onUpdate({ comboItems: newCombo });
              } else {
                onUpdate({ date: d, timeSlot: "" });
              }
            }}
            basePrice={(() => {
              if (isPackage) return 0;
              // For combos, show the current activity's price, not the combo total
              if (booking.comboItems && booking.comboItems.length > 0) {
                const currentActId = booking.comboItems[activeComboIndex]?.activityId;
                const currentAct = activities.find(a => a.id === currentActId);
                return currentAct?.price || 0;
              }
              return booking.activity?.price || 0;
            })()}
            pricingRules={(() => {
              // For combos, use the current activity's pricing rules
              if (booking.comboItems && booking.comboItems.length > 0) {
                const currentActId = booking.comboItems[activeComboIndex]?.activityId;
                const currentAct = activities.find(a => a.id === currentActId);
                return currentAct?.pricingRules || [];
              }
              return booking.activity?.pricingRules || [];
            })()}
            globalOps={globalOps}
            activityId={(() => {
              if (booking.comboItems && booking.comboItems.length > 0) {
                return booking.comboItems[activeComboIndex]?.activityId || "";
              }
              return booking.activity?.id || "";
            })()}
            packageDurationDays={isPackage ? durationDays : 0}
          />

          {/* Package date range summary */}
          {isPackage && booking.date && (
            <div className="mt-4 p-4 rounded-xl bg-[var(--s1)] border border-[var(--bw1)] animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-[0.5rem] uppercase tracking-widest font-black text-[var(--g300)] mb-1">Departure</p>
                  <p className="fd text-sm font-medium text-[var(--t1)]">{format(booking.date, "EEE, MMM d")}</p>
                  <p className="text-[0.6rem] text-[var(--t3)]">{format(booking.date, "yyyy")}</p>
                </div>
                <div className="flex items-center gap-2 px-4">
                  <div className="h-px w-8 bg-[var(--g300)]/30" />
                  <div className="px-3 py-1 rounded-full bg-[var(--g300)]/10 border border-[var(--g300)]/30">
                    <span className="text-[0.55rem] font-black uppercase tracking-widest text-[var(--g300)]">
                      {durationDays}D / {durationNights}N
                    </span>
                  </div>
                  <div className="h-px w-8 bg-[var(--g300)]/30" />
                </div>
                <div className="text-center">
                  <p className="text-[0.5rem] uppercase tracking-widest font-black text-[var(--g300)] mb-1">Return</p>
                  <p className="fd text-sm font-medium text-[var(--t1)]">{format(getEndDate(booking.date), "EEE, MMM d")}</p>
                  <p className="text-[0.6rem] text-[var(--t3)]">{format(getEndDate(booking.date), "yyyy")}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Time slots OR Journey At A Glance */}
        {isPackage ? (
          /* ── PACKAGE MODE: Journey At A Glance ── */
          <div>
            <p className="text-[0.7rem] tracking-wider uppercase mb-4 flex items-center gap-2" style={{ color: "var(--t3)" }}>
              <Compass size={12} style={{ color: "var(--g300)" }} /> Your Journey At A Glance
            </p>

            {booking.date ? (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
                {packageItinerary.length > 0 ? (
                  packageItinerary.map((day: any, dayIdx: number) => {
                    const dayDate = addDays(booking.date!, dayIdx);
                    return (
                      <div
                        key={day.dayNumber || dayIdx}
                        className="group rounded-xl border border-[var(--bw1)] bg-[var(--s1)] overflow-hidden transition-all hover:border-[var(--g300)]/30"
                      >
                        {/* Day header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[var(--g300)]/8 to-transparent border-b border-[var(--bw1)]">
                          <div className="w-8 h-8 rounded-lg bg-[var(--g300)]/15 border border-[var(--g300)]/30 flex items-center justify-center flex-shrink-0">
                            <span className="fd text-[0.7rem] font-bold text-[var(--g300)]">{day.dayNumber || dayIdx + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.5rem] uppercase tracking-widest font-black text-[var(--g300)]">
                              Day {day.dayNumber || dayIdx + 1} · {format(dayDate, "EEE, MMM d")}
                            </p>
                            <p className="text-[0.75rem] font-medium text-[var(--t1)] truncate">
                              {day.title || "Free Day"}
                            </p>
                          </div>
                        </div>

                        {/* Modules list */}
                        {day.modules && day.modules.length > 0 && (
                          <div className="px-4 py-2.5 space-y-1.5">
                            {day.modules.map((mod: any, modIdx: number) => (
                              <div key={mod.id || modIdx} className="flex items-center gap-2.5 py-1">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                                  mod.type === 'flight' ? 'bg-blue-500/10 text-blue-400' :
                                  mod.type === 'hotel' ? 'bg-purple-500/10 text-purple-400' :
                                  mod.type === 'transfer' ? 'bg-cyan-500/10 text-cyan-400' :
                                  mod.type === 'activity' ? 'bg-emerald-500/10 text-emerald-400' :
                                  mod.type === 'meal' ? 'bg-orange-500/10 text-orange-400' :
                                  'bg-[var(--g300)]/10 text-[var(--g300)]'
                                }`}>
                                  {MODULE_ICONS[mod.type] || <Compass size={12} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[0.7rem] text-[var(--t2)] font-medium truncate">{mod.title}</p>
                                </div>
                                {mod.time && (
                                  <span className="text-[0.55rem] text-[var(--t3)] font-bold flex-shrink-0">{mod.time}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Fallback for days with no modules */}
                        {(!day.modules || day.modules.length === 0) && (
                          <div className="px-4 py-3 flex items-center gap-2 text-[var(--t3)]">
                            <Palmtree size={12} />
                            <span className="text-[0.7rem] italic">Free day at leisure</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  /* Fallback: generate simple day cards from durationDays */
                  Array.from({ length: durationDays }, (_, i) => {
                    const dayDate = addDays(booking.date!, i);
                    return (
                      <div
                        key={i}
                        className="rounded-xl border border-[var(--bw1)] bg-[var(--s1)] px-4 py-3 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[var(--g300)]/15 border border-[var(--g300)]/30 flex items-center justify-center flex-shrink-0">
                          <span className="fd text-[0.7rem] font-bold text-[var(--g300)]">{i + 1}</span>
                        </div>
                        <div>
                          <p className="text-[0.5rem] uppercase tracking-widest font-black text-[var(--g300)]">
                            Day {i + 1}
                          </p>
                          <p className="text-[0.75rem] font-medium text-[var(--t1)]">
                            {format(dayDate, "EEEE, MMM d yyyy")}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 rounded-3xl text-[0.82rem] gap-4" style={{ border: "2px dashed var(--bw2)", background: "var(--bw5)", color: "var(--t4)" }}>
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                  <Calendar size={28} className="opacity-30" />
                </div>
                <span className="text-center px-6">Select your departure date to see the full journey plan</span>
              </div>
            )}
          </div>
        ) : (
          /* ── STANDARD MODE: Time Slots ── */
          <div>
            <p className="text-[0.7rem] tracking-wider uppercase mb-4 flex items-center gap-2" style={{ color: "var(--t3)" }}>
              <Clock size={12} style={{ color: "var(--g300)" }} /> {t('booking.available_slots')}
            </p>
            {(booking.comboItems ? booking.comboItems[activeComboIndex].date : booking.date) ? (
              <div className="grid grid-cols-1 gap-3">
                {(() => {
                  // For combos, use per-activity time slots; for standard, use the activity's own
                  let slotsToRender = booking.activity?.timeSlots || [];
                  if (booking.comboItems && booking.comboItems.length > 0) {
                    const currentActId = booking.comboItems[activeComboIndex]?.activityId;
                    const currentAct = activities.find(a => a.id === currentActId);
                    if (currentAct?.timeSlots) {
                      slotsToRender = currentAct.timeSlots;
                    }
                  }
                  return slotsToRender;
                })().map((slot) => {
                  const currentItem = booking.comboItems ? booking.comboItems[activeComboIndex] : null;
                  const currentSlot = currentItem ? currentItem.timeSlot : booking.timeSlot;
                  const sel = currentSlot === slot;
                  const selectedDate = currentItem ? currentItem.date : booking.date;
                  const isToday = selectedDate ? isSameDay(selectedDate, new Date()) : false;
                  const BUFFER = 60;
                  const now = new Date();
                  const dubaiOffset = 4;
                  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
                  const dubaiNow = new Date(utc + (3600000 * dubaiOffset));
                  const currentMins = dubaiNow.getHours() * 60 + dubaiNow.getMinutes();
                  const slotMins = timeToMins(slot);
                  const isPast = isToday && slotMins < (currentMins + BUFFER);

                  let isConflict = false;
                  if (booking.comboItems && currentItem?.date) {
                    const targetDate = currentItem.date;
                    const targetSlotMins = timeToMins(slot);
                    isConflict = booking.comboItems.some((item, idx) => {
                      if (idx === activeComboIndex) return false;
                      if (!item.date || !item.timeSlot) return false;
                      if (!isSameDay(item.date, targetDate)) return false;
                      const otherAct = activities.find(a => a.id === item.activityId);
                      if (!otherAct) return false;
                      const otherStartMins = timeToMins(item.timeSlot);
                      const otherDuration = parseDuration(otherAct.duration);
                      const otherEndMins = otherStartMins + otherDuration + BUFFER;
                      const overlapsOther = targetSlotMins >= otherStartMins && targetSlotMins < otherEndMins;
                      const targetDuration = parseDuration(activities.find(a => a.id === currentItem.activityId)?.duration || "1 Hour");
                      const targetEndMins = targetSlotMins + targetDuration + BUFFER;
                      const otherOverlapsTarget = otherStartMins >= targetSlotMins && otherStartMins < targetEndMins;
                      return overlapsOther || otherOverlapsTarget;
                    });
                  }

                  return (
                    <button
                      key={slot}
                      disabled={isConflict || isPast}
                      onClick={() => {
                        if (booking.comboItems) {
                          const newCombo = [...booking.comboItems];
                          newCombo[activeComboIndex].timeSlot = slot;
                          onUpdate({ comboItems: newCombo });
                        } else {
                          onUpdate({ timeSlot: slot });
                        }
                      }}
                      className={`w-full px-5 py-4 rounded-2xl text-[0.82rem] font-medium transition-all duration-300 flex items-center justify-between group shadow-sm ${(isConflict || isPast) ? 'opacity-40 cursor-not-allowed bg-white/5 grayscale' : ''
                        }`}
                      style={
                        sel
                          ? { background: "rgba(212,150,42,0.18)", border: "2px solid var(--g300)", color: "var(--g200)" }
                          : !isConflict ? { background: "var(--bw4)", border: "1px solid var(--bw2)", color: "var(--t2)" } : {}
                      }
                    >
                      <span className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg transition-colors ${sel ? 'bg-[var(--g300)]/20' : 'bg-white/5'}`}>
                          <Clock size={14} className={sel ? "text-[var(--g200)]" : "text-white/40"} />
                        </div>
                        {slot}
                      </span>
                      {sel && (
                        <div className="w-5 h-5 rounded-full bg-[var(--g300)] flex items-center justify-center animate-in zoom-in-50 duration-300">
                          <Check size={12} style={{ color: "#06040A" }} />
                        </div>
                      )}
                      {isPast && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/10">
                          <Clock size={10} className="text-red-400" />
                          <span className="text-[0.55rem] font-black uppercase tracking-tighter text-red-400 italic">{t('booking.expired')}</span>
                        </div>
                      )}
                      {isConflict && !isPast && (
                        <span className="text-[0.6rem] font-black uppercase tracking-tighter text-white/30 border border-white/10 px-2 py-0.5 rounded italic">
                          {t('booking.overlap_blocked')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 rounded-3xl text-[0.82rem] gap-4" style={{ border: "2px dashed var(--bw2)", background: "var(--bw5)", color: "var(--t4)" }}>
                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center">
                  <Calendar size={28} className="opacity-30" />
                </div>
                <span className="text-center px-6">{t('booking.select_date_instruction')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
