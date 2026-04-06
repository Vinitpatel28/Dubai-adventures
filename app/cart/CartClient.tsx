"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, Trash2, Clock, Star, MapPin, Users, ArrowRight,
  ArrowLeft, ChevronRight, Package, Calendar, Sparkles, X
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart, CartItem } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";
import { toast } from "sonner";

export default function CartClient({ categories = [] }: { categories: any[] }) {
  const router = useRouter();
  const { items, removeFromCart, clearCart, count } = useCart();
  const { convert } = useCurrency();

  const totalPrice = items.reduce((sum, item) => sum + item.activity.price, 0);

  const getProgressLabel = (item: CartItem) => {
    if (!item.bookingProgress) return null;
    const step = item.bookingProgress.step;
    const labels: Record<number, string> = {
      1: "Schedule selected",
      2: "Guests configured",
      3: "Contact info entered",
      4: "Review completed",
      5: "Payment pending",
    };
    return labels[step] || null;
  };

  return (
    <main className="min-h-screen bg-[var(--s0)] text-[var(--t1)] selection:bg-[var(--g300)]/30">
      <Navbar categories={categories} hasBooking={false} onCartClick={() => {}} forceDark={false} />

      {/* ── Header ── */}
      <header className="pt-28 pb-10 border-b border-[var(--bw1)] bg-[var(--s1)]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="anim-fade-up">
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-[var(--g300)] font-bold mb-2 flex items-center gap-2">
                <ShoppingCart size={12} /> Your Collection
              </p>
              <h1 className="fd text-3xl md:text-4xl text-[var(--t1)] font-normal">
                Adventure <span className="gold-text">Cart</span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {count > 0 && (
                <button
                  onClick={() => { if (window.confirm("Clear all items from cart?")) clearCart(); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-red-500/20 text-red-400/70 text-[0.65rem] font-black uppercase tracking-widest hover:bg-red-500/5 hover:text-red-400 transition-all"
                >
                  <Trash2 size={13} /> Clear All
                </button>
              )}
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--bw1)] border border-[var(--bw2)]">
                <ShoppingCart size={14} className="text-[var(--g300)]" />
                <span className="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--t2)]">
                  {count} {count === 1 ? "Experience" : "Experiences"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 sm:px-8 py-10">
        {count === 0 ? (
          /* ── Empty State ── */
          <div className="text-center py-24 rounded-3xl bg-[var(--s1)] border border-[var(--bw1)] anim-fade-up">
            <div className="w-20 h-20 rounded-full bg-[var(--bw2)] flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={30} className="text-[var(--g300)]" />
            </div>
            <h2 className="fd text-2xl text-[var(--t1)] mb-2">Your Cart is Empty</h2>
            <p className="text-[0.75rem] text-[var(--t3)] max-w-xs mx-auto mb-8 leading-relaxed uppercase tracking-wider">
              Browse our curated experiences and add your favorites to start planning your Dubai adventure.
            </p>
            <Link
              href="/#experiences"
              className="inline-flex items-center gap-2 btn-g px-8 py-3"
            >
              Explore Experiences <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* ── Cart Content ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* ── Cart Items List ── */}
            <div className="lg:col-span-8 space-y-4">
              {items.map((item, index) => {
                const id = item.activity.id || (item.activity as any)._id;
                const progressLabel = getProgressLabel(item);
                const discountPercent = item.activity.originalPrice && item.activity.originalPrice > item.activity.price
                  ? Math.round(((item.activity.originalPrice - item.activity.price) / item.activity.originalPrice) * 100)
                  : 0;

                return (
                  <div
                    key={id}
                    className="bg-[var(--s1)] border border-[var(--bw1)] rounded-2xl overflow-hidden hover:border-[var(--bw2)] transition-all group anim-fade-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="relative w-full sm:w-56 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
                        <Image
                          src={item.activity.image}
                          alt={item.activity.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 224px"
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {discountPercent > 0 && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[0.55rem] font-black uppercase tracking-wider backdrop-blur-sm">
                            Save {discountPercent}%
                          </div>
                        )}
                        {progressLabel && (
                          <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-lg bg-[var(--g300)]/15 backdrop-blur-md border border-[var(--g300)]/30">
                            <div className="flex items-center gap-2">
                              <Sparkles size={10} className="text-[var(--g300)]" />
                              <span className="text-[0.55rem] font-black uppercase tracking-widest text-[var(--g300)]">
                                {progressLabel}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0">
                        <div>
                          {/* Category + Rating */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <MapPin size={10} className="text-[var(--g300)]" />
                              <span className="text-[0.6rem] uppercase tracking-[0.2em] font-bold text-[var(--t3)]">
                                {item.activity.subtitle || item.activity.category}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--bw1)] border border-[var(--bw2)]">
                              <Star size={9} className="text-[var(--g300)] fill-[var(--g300)]" />
                              <span className="text-[0.62rem] font-bold text-[var(--t1)]">{item.activity.rating}</span>
                              <span className="text-[0.55rem] text-[var(--t4)]">({item.activity.reviewCount})</span>
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="fd text-[1.05rem] font-semibold text-[var(--t1)] mb-2 leading-snug line-clamp-1">
                            {item.activity.title}
                          </h3>

                          {/* Short Description */}
                          <p className="text-[0.78rem] text-[var(--t3)] line-clamp-2 mb-4 leading-relaxed">
                            {item.activity.shortDescription}
                          </p>

                          {/* Meta pills */}
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--bw1)] border border-[var(--bw2)] text-[0.6rem] font-bold text-[var(--t2)]">
                              <Clock size={10} className="text-[var(--g300)]" />
                              {(item.activity as any).isPackage
                                ? `${(item.activity as any).durationDays}D / ${(item.activity as any).durationNights}N`
                                : item.activity.duration}
                            </span>
                            {item.activity.highlights?.slice(0, 2).map((h: string) => (
                              <span key={h} className="px-3 py-1 rounded-full bg-[var(--bw1)] border border-[var(--bw2)] text-[0.6rem] font-medium text-[var(--t3)]">
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom: Price + Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-[var(--bw1)]">
                          <div>
                            <span className="text-[0.55rem] uppercase tracking-wider text-[var(--t4)] block">From</span>
                            <div className="flex items-baseline gap-1.5">
                              {item.activity.originalPrice && item.activity.originalPrice > item.activity.price && (
                                <span className="text-[0.75rem] line-through text-red-400/60 fd">{convert(item.activity.originalPrice)}</span>
                              )}
                              <span className="fd text-xl font-medium gold-text">{convert(item.activity.price)}</span>
                            </div>
                            <span className="text-[0.6rem] text-[var(--t4)]">per person</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeFromCart(id)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/15 text-red-400/50 text-[0.6rem] font-bold uppercase tracking-widest hover:bg-red-500/5 hover:text-red-400 hover:border-red-500/30 transition-all"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                            <Link
                              href={`/experience/${id}`}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--bw1)] border border-[var(--bw2)] text-[0.6rem] font-bold uppercase tracking-widest text-[var(--t2)] hover:bg-[var(--bw2)] hover:text-[var(--t1)] transition-all"
                            >
                              {progressLabel ? "Resume" : "Book"} <ChevronRight size={12} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Summary Sidebar ── */}
            <div className="lg:col-span-4">
              <div className="sticky top-32 space-y-6">
                {/* Order Summary Card */}
                <div className="bg-[var(--s1)] border border-[var(--bw1)] rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-[var(--bw1)]">
                    <h3 className="text-[0.7rem] font-black uppercase tracking-[0.2em] text-[var(--t2)] flex items-center gap-2">
                      <Package size={14} className="text-[var(--g300)]" /> Order Summary
                    </h3>
                  </div>

                  <div className="p-6 space-y-4">
                    {items.map((item) => {
                      const id = item.activity.id || (item.activity as any)._id;
                      return (
                        <div key={id} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[var(--bw1)]">
                              <Image src={item.activity.image} alt="" width={40} height={40} className="object-cover w-full h-full" />
                            </div>
                            <span className="text-[0.72rem] font-medium text-[var(--t2)] truncate">{item.activity.title}</span>
                          </div>
                          <span className="text-[0.72rem] font-bold text-[var(--t1)] flex-shrink-0 fd">{convert(item.activity.price)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-6 border-t border-[var(--bw1)] bg-[var(--s2)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--t3)]">Subtotal ({count} items)</span>
                      <span className="fd text-lg font-bold gold-text">{convert(totalPrice)}</span>
                    </div>
                    <p className="text-[0.55rem] text-[var(--t4)] italic mb-5">Final price calculated during checkout per activity</p>

                    <div className="space-y-3">
                      {items.length === 1 ? (
                        <Link
                          href={`/experience/${items[0].activity.id || (items[0].activity as any)._id}`}
                          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl btn-g text-[0.7rem] font-black uppercase tracking-widest shadow-lg"
                        >
                          Book Now <ArrowRight size={14} />
                        </Link>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-[0.55rem] text-[var(--t4)] uppercase tracking-widest font-bold text-center">Book each experience individually</p>
                          {items.map((item) => {
                            const id = item.activity.id || (item.activity as any)._id;
                            return (
                              <Link
                                key={id}
                                href={`/experience/${id}`}
                                className="flex items-center justify-between gap-3 w-full py-3 px-4 rounded-xl bg-[var(--bw1)] border border-[var(--bw2)] text-[0.65rem] font-bold text-[var(--t2)] hover:bg-[var(--bw2)] hover:text-[var(--t1)] transition-all group"
                              >
                                <span className="truncate">{item.activity.title}</span>
                                <ArrowRight size={12} className="text-[var(--g300)] flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                              </Link>
                            );
                          })}
                        </div>
                      )}

                      <Link
                        href="/#experiences"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[var(--bw2)] text-[0.65rem] font-bold uppercase tracking-widest text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--bw1)] transition-all"
                      >
                        <ArrowLeft size={12} /> Continue Browsing
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="p-5 rounded-2xl bg-[var(--bw5)] border border-[var(--bw1)] space-y-3">
                  {[
                    "Secure checkout & instant confirmation",
                    "Free cancellation up to 24h before",
                    "Best price guarantee on all experiences",
                    "Cart saved automatically — come back anytime",
                  ].map((text) => (
                    <div key={text} className="flex items-start gap-2.5">
                      <ChevronRight size={10} className="text-[var(--g300)] mt-0.5 flex-shrink-0" />
                      <span className="text-[0.62rem] text-[var(--t3)] font-medium uppercase tracking-wider leading-relaxed">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="gold-line mt-10" />
      <Footer categories={categories} />
    </main>
  );
}
