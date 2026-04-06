"use client";

import Image from "next/image";
import { X, Clock, Users, Calendar, Shield, RotateCcw, CreditCard, Pencil, Zap, Car, Tag } from "lucide-react";
import { Activity, BookingState } from "../types";
import { format, isSameDay, startOfDay } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency } from "../context/CurrencyContext";
import ComboImageGallery from "./ComboImageGallery";

interface Props {
  booking: BookingState;
  totalPrice: number;
  onRemove: () => void;
  onEdit: () => void;
  globalOps?: any;
  activities?: Activity[];
}

export default function BookingSidebar({ booking, totalPrice, onRemove, onEdit, globalOps, activities }: Props) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { convert } = useCurrency();
  if (!booking.activity) return null;

  const handleExpressPay = () => {
    toast.success("Authenticating Express Payment...", {
      description: "Using saved payment method (Apple Pay/Google Pay compatible)",
      icon: <Zap size={16} className="text-amber-500" />,
      duration: 3000
    });
    // This would simulate the 2026 "One-Tap" experience
  };

  return (
    <div
      className="rounded-2xl overflow-hidden a-panel"
      style={{
        background: "var(--s2)",
        border: "1px solid var(--bg1)",
        boxShadow: "0 24px 70px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* ─── Header ─────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{
          background: "linear-gradient(135deg, rgba(212,150,42,0.16), rgba(212,150,42,0.04))",
          borderBottom: "1px solid rgba(212,150,42,0.18)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, var(--g500), var(--g300))" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#05030A" strokeWidth="2.2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <div>
            <p className="fd text-[0.95rem] font-medium" style={{ color: "var(--t1)" }}>{t('booking.your_booking')}</p>
            <p className="text-[0.62rem] uppercase tracking-wider" style={{ color: "var(--t3)" }}>{t('booking.summary')}</p>
          </div>
        </div>
        <button
          onClick={onRemove}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
          style={{ background: "var(--bw1)", border: "1px solid var(--bw2)", color: "var(--t3)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)";
            (e.currentTarget as HTMLElement).style.color = "#F87171";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.35)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--bw1)";
            (e.currentTarget as HTMLElement).style.color = "var(--t3)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--bw2)";
          }}
        >
          <X size={12} />
        </button>
      </div>

      {/* ─── Package preview ─────────────────────── */}
      <div className="p-4">
        <div
          className="flex gap-3 p-3 rounded-xl"
          style={{ background: "var(--bw4)", border: "1px solid var(--bw1)" }}
        >
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            {booking.comboItems && (booking.activity as any).gallery && (booking.activity as any).gallery.length > 0 ? (
              <ComboImageGallery images={(booking.activity as any).gallery} size="sm" className="w-full h-full" />
            ) : (
              <Image src={booking.activity.image} alt={booking.activity.title} fill className="object-cover" />
            )}
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="fd text-[0.82rem] font-medium leading-snug line-clamp-2 mb-0.5" style={{ color: "var(--t1)" }}>
              {booking.activity.title}
            </p>
            <p className="text-[0.64rem]" style={{ color: "var(--g300)" }}>{booking.activity.subtitle}</p>
          </div>
        </div>
      </div>

      {/* ─── Booking details ─────────────────────── */}
      <div className="px-4 pb-3 space-y-2.5">
        {(() => {
          const isPackage = booking.activity.isPackage || booking.activity.category === 'signature-journeys';
          const isCombo = booking.activity.isComboDeal && booking.comboItems && booking.comboItems.length > 0;
          const durationDays = (booking.activity as any)?.durationDays || 1;
          const durationNights = (booking.activity as any)?.durationNights || 0;

          if (isPackage && booking.date) {
            const endDate = new Date(booking.date);
            endDate.setDate(endDate.getDate() + durationDays - 1);
            return (
              <>
                <DetailRow icon={<Calendar size={12} />}>
                  <span>{format(booking.date, "EEE, MMM d")} → {format(endDate, "EEE, MMM d")}</span>
                </DetailRow>
                <div className="ml-6 -mt-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[var(--g300)]/10 border border-[var(--g300)]/25 text-[0.5rem] font-black uppercase tracking-widest text-[var(--g300)]">
                    {durationDays} Days / {durationNights} Nights
                  </span>
                </div>
              </>
            );
          }

          if (isCombo && booking.comboItems) {
            // Show per-activity combo schedule
            return (
              <>
                {booking.comboItems.map((item, idx) => {
                  const actTitle = booking.activity?.subtitle?.split(" + ")[idx] || `Exp ${idx + 1}`;
                  return (
                    <div key={idx} className="ml-0.5">
                      <p className="text-[0.5rem] uppercase tracking-widest font-black text-[var(--g300)] mb-0.5">Exp {idx + 1}</p>
                      <DetailRow icon={<Calendar size={12} />}>
                        <span>
                          {item.date ? format(new Date(item.date), "EEE, MMM d") : "Not set"}
                          {item.timeSlot && <span style={{ color: "var(--g300)" }}> · {item.timeSlot}</span>}
                        </span>
                      </DetailRow>
                    </div>
                  );
                })}
              </>
            );
          }

          return booking.date ? (
            <DetailRow icon={<Calendar size={12} />}>
              <span>{format(booking.date, "EEE, MMM d, yyyy")}</span>
              {booking.timeSlot && booking.timeSlot !== "Package Start" && <span style={{ color: "var(--g300)" }}> · {booking.timeSlot}</span>}
            </DetailRow>
          ) : null;
        })()}
        <DetailRow icon={<Clock size={12} />}>{booking.activity.duration}</DetailRow>
        <DetailRow icon={<Users size={12} />}>
          {booking.adults} {booking.adults === 1 ? t('booking.adult') : t('booking.adults')}
          {booking.children > 0 && `, ${booking.children} ${booking.children === 1 ? t('booking.child') : t('booking.children')}`}
        </DetailRow>
        {booking.selectedTransportIndex !== undefined && booking.activity.transportOptions && (
          <DetailRow icon={<Car size={12} />}>
            {booking.activity.transportOptions[booking.selectedTransportIndex].label}
          </DetailRow>
        )}
      </div>

      {/* ─── Price breakdown ─────────────────────── */}
      <div className="mx-4 mb-3 p-4 rounded-2xl" style={{ background: "var(--bw5)", border: "1px solid var(--bw1)" }}>
        <div className="space-y-2 mb-3">
          {(() => {
            const isCombo = booking.activity.isComboDeal && booking.comboItems && booking.comboItems.length > 0;

            if (isCombo && booking.comboItems) {
              // ── COMBO PRICE BREAKDOWN ──
              // Show each activity's line-item cost + combo discount
              let comboBaseTotal = 0;
              const lines = booking.comboItems.map((item, idx) => {
                const act = activities?.find(a => a.id === item.activityId);
                if (!act) return null;
                const adultP = act.price;
                const childP = typeof act.childPrice === 'number' ? act.childPrice : adultP * 0.5;
                const lineTotal = (adultP * booking.adults) + (childP * booking.children);
                comboBaseTotal += lineTotal;
                const shortTitle = act.title.length > 22 ? act.title.slice(0, 22) + '…' : act.title;
                return (
                  <PriceRow
                    key={idx}
                    label={`${shortTitle}`}
                    val={convert(lineTotal)}
                  />
                );
              });

              const savings = comboBaseTotal - totalPrice;

              return (
                <>
                  {lines}
                  {savings > 0 && (
                    <div className="flex items-center justify-between text-[0.7rem] text-emerald-400 font-bold pt-1">
                      <span>⚡ Combo Savings</span>
                      <span>- {convert(Math.round(savings))}</span>
                    </div>
                  )}
                </>
              );
            }

            // ── STANDARD (non-combo) PRICE BREAKDOWN ──
            const { adultFinal, childFinal } = (() => {
              let baseA = booking.activity.price;
              let baseC = typeof booking.activity.childPrice === 'number' ? booking.activity.childPrice : (baseA * 0.5);
              let markupA = 0;
              let markupC = 0;

              if (booking.date) {
                const selDate = startOfDay(new Date(booking.date));

                if (booking.activity.pricingRules) {
                  const rule = booking.activity.pricingRules.find(r => {
                    if (r.type === 'date' && r.date) return isSameDay(new Date(r.date), selDate);
                    if (r.type === 'weekend') return selDate.getDay() === 0 || selDate.getDay() === 6;
                    return false;
                  });
                  if (rule) { markupA += rule.adjustment; markupC += rule.adjustment; }
                }

                if (globalOps?.pricingRules) {
                  const gRule = globalOps.pricingRules.find((r: any) => {
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
                  if (gRule) {
                    if (gRule.adjustmentType === 'fixed') { markupA += gRule.adjustment; markupC += gRule.adjustment; }
                    else { markupA += (baseA * (gRule.adjustment / 100)); markupC += (baseC * (gRule.adjustment / 100)); }
                  }
                }
              }
              return { adultFinal: baseA + markupA, childFinal: baseC + markupC };
            })();
            const priceWithSurcharge = adultFinal;
            const hasSurcharge = priceWithSurcharge > booking.activity.price;

            return (
              <>
                <PriceRow
                  label={`${booking.adults} × ${convert(priceWithSurcharge)}`}
                  val={convert(booking.adults * priceWithSurcharge)}
                />
                {booking.children > 0 && (
                  <PriceRow
                    label={`${booking.children} child × ${convert(childFinal)}`}
                    val={convert(booking.children * childFinal)}
                  />
                )}
                {hasSurcharge && (
                  <div className="flex items-center gap-1.5 text-[0.6rem] text-[var(--g300)] font-black uppercase tracking-tighter ml-1">
                    <Tag size={10} /> {t('booking.seasonal_surcharge')}
                  </div>
                )}
                {booking.selectedTransportIndex !== undefined && booking.activity.transportOptions && (
                  <div className="pt-2">
                    {(() => {
                      const opt = booking.activity.transportOptions[booking.selectedTransportIndex];
                      const tPrice = opt.isPerPerson ? (opt.price * (booking.adults + booking.children)) : opt.price;
                      return (
                        <PriceRow
                          label={`${opt.label} (${opt.isPerPerson ? 'per head' : 'flat'})`}
                          val={`+ ${convert(tPrice)}`}
                        />
                      )
                    })()}
                  </div>
                )}
                {booking.promoCode && (
                  <PriceRow
                    label={`Promo: ${booking.promoCode.code}`}
                    val={`- ${convert(((adultFinal * booking.adults + childFinal * booking.children) + (booking.selectedTransportIndex !== undefined ? (booking.activity.transportOptions![booking.selectedTransportIndex].isPerPerson ? (booking.activity.transportOptions![booking.selectedTransportIndex].price * (booking.adults + booking.children)) : booking.activity.transportOptions![booking.selectedTransportIndex].price) : 0)) - totalPrice)}`}
                  />
                )}
              </>
            );
          })()}
        </div>
        <div className="gold-line mb-3" />
        <div className="flex items-center justify-between">
          <span className="text-[0.67rem] uppercase tracking-wider" style={{ color: "var(--t3)" }}>{t('grid.total')}</span>
          <span className="fd text-[1.85rem] font-medium gold-text leading-none">
            {convert(totalPrice)}
          </span>
        </div>
      </div>

      {/* ─── Action Buttons ────────────────────────── */}
      <div className="px-4 pb-4 space-y-3">
        <button
          onClick={onEdit}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[0.7rem] uppercase tracking-wide transition-all duration-200"
          style={{ border: "1px dashed var(--bw2)", color: "var(--t3)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--t2)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--bw3)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--t3)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--bw2)"; }}
        >
          <Pencil size={11} /> {t('booking.edit_requirements')}
        </button>
      </div>

      {/* ─── Trust badges ────────────────────────── */}
      <div
        className="px-4 py-3.5 space-y-2"
        style={{ borderTop: "1px solid var(--bw1)", background: "var(--bw5)" }}
      >
        {[
          { icon: <Shield size={11} />, text: t('booking.secure_encrypted') },
          { icon: <RotateCcw size={11} />, text: t('booking.free_cancellation_48') },
          { icon: <CreditCard size={11} />, text: t('booking.no_hidden_fees') },
        ].map((t) => (
          <div key={t.text} className="flex items-center gap-2 text-[0.64rem]" style={{ color: "var(--t3)" }}>
            <span style={{ color: "var(--g500)" }}>{t.icon}</span>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-[0.78rem]" style={{ color: "var(--t2)" }}>
      <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--g400)" }}>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function PriceRow({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex justify-between text-[0.76rem]">
      <span style={{ color: "var(--t3)" }}>{label}</span>
      <span style={{ color: "var(--t2)" }}>{val}</span>
    </div>
  );
}
