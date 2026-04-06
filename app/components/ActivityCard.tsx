"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Clock, ChevronDown, MapPin, Heart, Check, Car, List, ShoppingCart } from "lucide-react";
import { Activity } from "../types";
import { useCurrency } from "../context/CurrencyContext";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";

interface Props {
  activity: Activity;
  isExpanded: boolean;
  isSelected: boolean;
  isWishlisted: boolean;
  onExpand: () => void;
  onToggleWishlist: () => void;
  promo?: {
    code: string;
    description: string;
    discountValue: number;
    discountType: string;
  } | null;
}

const BADGE_MAP: Record<string, { bg: string; color: string; border: string }> = {
  gold: { bg: "var(--g300)", color: "#05030A", border: "transparent" },
  luxury: { bg: "rgba(30,26,16,0.95)", color: "var(--g200)", border: "var(--bg2)" },
  popular: { bg: "rgba(255,255,255,0.14)", color: "#fff", border: "rgba(255,255,255,0.22)" },
  new: { bg: "rgba(20,60,35,0.9)", color: "#6EE7A0", border: "rgba(110,231,160,0.3)" },
  recommended: { bg: "rgba(59,130,246,0.9)", color: "#fff", border: "rgba(255,255,255,0.3)" },
  bestseller: { bg: "rgba(245,158,11,0.9)", color: "#fff", border: "rgba(255,255,255,0.3)" },
};

export default function ActivityCard({ activity, isExpanded, isSelected, isWishlisted, onExpand, onToggleWishlist, promo = null }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const badge = BADGE_MAP[activity.badgeType ?? "popular"];
  const { convert } = useCurrency();
  const { addToCart, isInCart } = useCart();

  const discountPercent = activity.originalPrice && activity.originalPrice > activity.price
    ? Math.round(((activity.originalPrice - activity.price) / activity.originalPrice) * 100)
    : 0;

  const cardId = activity.id || (activity as any)._id;
  const inCart = isInCart(cardId);

  return (
    <article
      onClick={() => router.push(`/experience/${cardId}`)}
      className={`activity-card flex flex-col h-full group transition-all duration-500 rounded-[22px] cursor-pointer ${isExpanded ? "card-expanded" : ""} ${isSelected ? "card-selected" : ""} ${activity.isComboDeal ? 'luxury-combo-glow border-[var(--g300)]/40 ring-1 ring-[var(--g300)]' : ''}`}
      id={`card-${activity.id}`}
      style={{
        boxShadow: activity.isComboDeal ? "0 20px 50px -12px rgba(212,150,42,0.15)" : "none"
      }}
    >
      <div className="flex flex-col h-full w-full relative overflow-hidden rounded-[22px]">
        {/* ── Image section ── */}
        <div className="relative h-[230px] overflow-hidden flex-shrink-0">
          {/* Skeleton */}
          <div className="absolute inset-0 bg-[#0A0A0B] z-0 animate-pulse" />
          <Image
            src={activity.image}
            alt={activity.title}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110 z-10"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Top row: badge + action buttons */}
          <div className="absolute top-3.5 inset-x-3.5 flex items-start justify-between z-10">
            <div className="flex flex-col gap-2 items-start">
              {activity.isComboDeal ? (
                <div className="flex flex-col gap-1.5 translate-y-[-2px]">
                  <span className="badge-gold">
                    {t('ui.best_value')}
                  </span>
                  {discountPercent > 0 && (
                    <span className="badge-save">
                      {t('ui.save')} {discountPercent}%
                    </span>
                  )}
                </div>
              ) : activity.badge ? (
                <span
                  className="px-3 py-1 rounded-full text-[0.61rem] tracking-[0.12em] uppercase font-semibold inline-block backdrop-blur-md"
                  style={{ background: badge.bg, color: "#fff", border: `1px solid rgba(255,255,255,0.2)` }}
                >
                  {activity.badge}
                </span>
              ) : promo ? (
                <span className="badge-save !bg-emerald-600 shadow-lg">
                  {promo.description || `${promo.discountType === 'percentage' ? promo.discountValue + '%' : convert(promo.discountValue)} ${t('grid.off')}`}
                </span>
              ) : null}
            </div>

            {/* Right side: Cart + Wishlist stacked */}
            <div className="flex flex-col gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleWishlist(); }}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 backdrop-blur-md shadow-sm border ${isWishlisted ? 'scale-110' : 'hover:scale-110'}`}
                style={{
                  background: isWishlisted ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                  borderColor: isWishlisted ? "white" : "rgba(255,255,255,0.2)",
                }}
                aria-label="Toggle wishlist"
              >
                <Heart
                  size={14}
                  fill={isWishlisted ? "#e91e63" : "transparent"}
                  stroke={isWishlisted ? "#e91e63" : "white"}
                  strokeWidth={isWishlisted ? 2 : 2.5}
                />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); addToCart(activity); }}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 backdrop-blur-md shadow-sm border ${inCart ? 'scale-110' : 'hover:scale-110'}`}
                style={{
                  background: inCart ? "rgba(16,185,129,0.9)" : "rgba(255,255,255,0.15)",
                  borderColor: inCart ? "rgba(16,185,129,1)" : "rgba(255,255,255,0.2)",
                }}
                aria-label={inCart ? "In cart" : "Add to cart"}
              >
                {inCart ? (
                  <Check size={14} stroke="white" strokeWidth={3} />
                ) : (
                  <ShoppingCart size={13} stroke="white" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Card body ── */}
        <div className="flex flex-col flex-1 p-5 bg-[var(--s0)]">
          {/* Top Info Row: Rating & Specs */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 px-2.5 py-1.2 bg-[var(--s1)] rounded-full border border-[var(--bw1)] shadow-sm">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={9}
                    className={`${s <= Math.round(activity.rating) ? "" : "opacity-30"}`}
                    style={{ color: s <= Math.round(activity.rating) ? "var(--g300)" : "var(--t4)", fill: s <= Math.round(activity.rating) ? "var(--g300)" : "none" }}
                  />
                ))}
              </div>
              <span className="text-[0.68rem] font-bold text-[var(--t1)]">{activity.rating}</span>
              <span className="text-[0.62rem] text-[var(--t3)] font-medium">({(activity.reviewCount || 0).toLocaleString()})</span>
            </div>

            <div className="flex items-center gap-2">
              {activity.transportOptions && activity.transportOptions.length > 0 && (
                <div className="p-1 rounded-full bg-[var(--s1)] text-[var(--t3)] border border-[var(--bw1)]" title="Transport Included">
                  <Car size={13} />
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--s1)] rounded-full border border-[var(--bw1)]">
                <Clock size={11} className="text-[var(--g300)]" />
                <span className="text-[0.65rem] font-bold text-[var(--t2)] tracking-tight">
                  {(activity as any).isPackage ? `${(activity as any).durationDays}D / ${(activity as any).durationNights}N` : activity.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Category label */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <MapPin size={10} style={{ color: "var(--g300)" }} />
            <span
              className="text-[0.61rem] tracking-[0.2em] uppercase font-bold"
              style={{ color: "var(--t3)" }}
            >
              {activity.subtitle}
            </span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-2 mb-2.5">
            <h3
              className={`fd text-[1.125rem] font-semibold leading-[1.3] line-clamp-2 min-h-[2.6em] transition-colors duration-300 ${activity.isComboDeal || (activity as any).isPackage ? 'gold-text text-lg' : 'text-[var(--t1)] group-hover:gold-text'}`}
              style={{ letterSpacing: "-0.01em" }}
            >
              {activity.title}
            </h3>
          </div>

          {activity.isComboDeal && !(activity as any).isPackage && (
            <div className="mb-4 flex items-center gap-3">
              <div className="h-[1px] bg-gradient-to-r from-transparent via-[var(--g300)]/30 to-transparent flex-1" />
              <p className="text-[0.6rem] font-black tracking-[0.25em] uppercase text-[var(--g300)] whitespace-nowrap">
                {t('grid.multi_activity_bundle') || 'Multi-Activity Bundle'}
              </p>
              <div className="h-[1px] bg-gradient-to-r from-transparent via-[var(--g300)]/30 to-transparent flex-1" />
            </div>
          )}

          {(activity as any).isPackage && (
            <div className="mb-4 flex items-center justify-center py-2 bg-gradient-to-r from-[var(--g300)]/5 via-[var(--g300)]/15 to-[var(--g300)]/5 border border-[var(--g300)]/30 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <p className="text-[0.55rem] font-black tracking-[0.2em] uppercase text-[var(--g300)] flex items-center gap-1.5">
                <Star size={9} className="fill-[var(--g300)]" /> Signature Journey
              </p>
            </div>
          )}

          {/* Short description */}
          <p className="text-[0.82rem] leading-[1.65] line-clamp-2 mb-4 min-h-[3.3em] font-medium" style={{ color: "var(--t2)" }}>
            {activity.shortDescription}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {activity.highlights.slice(0, 3).map((h: string) => (
              <span
                key={h}
                className="text-[0.62rem] tracking-wide px-3 py-1 rounded-full font-semibold"
                style={{ background: "var(--s1)", border: "1px solid var(--bw1)", color: "var(--t2)" }}
              >
                {h}
              </span>
            ))}
          </div>

          {/* Footer: price + CTA — ORIGINAL FORMAT RESTORED */}
          <div
            className="flex items-center justify-between mt-auto pt-4"
            style={{ borderTop: "1px solid var(--bw1)" }}
          >
            <div>
              <span className="text-[0.6rem] uppercase tracking-wider block mb-0.5" style={{ color: "var(--t3)" }}>
                {t('ui.from')}
              </span>
              <div className="flex items-baseline gap-1.5">
                {activity.originalPrice && activity.originalPrice > activity.price && (
                  <span className="text-[0.8rem] line-through text-red-400 opacity-80 fd">
                    {convert(activity.originalPrice)}
                  </span>
                )}
                <span className="fd text-[1.65rem] font-medium gold-text leading-none">
                  {convert(activity.price)}
                </span>
              </div>
              <span className="text-[0.68rem] block mt-0.5" style={{ color: "var(--t3)" }}>{t('ui.person')}</span>
            </div>

            <div
              className="px-5 py-2.5 rounded-full text-[0.66rem] font-bold tracking-widest uppercase transition-all duration-300 bg-[var(--bw1)] border border-[var(--bw2)] text-[var(--t2)] group-hover:bg-[var(--bw2)] active:scale-95"
            >
              {t('ui.view_details')}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
