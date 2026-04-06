"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, BookingState, BookingConfirmation } from "../types";
import { Loader2, Lock } from "lucide-react";
import Navbar from "./Navbar";
import BookingSteps from "./BookingSteps";
import BookingSidebar from "./BookingSidebar";
import BookingSuccess from "./BookingSuccess";
import Footer from "./Footer";
import { toast } from "sonner";
import { isSameDay, startOfDay } from "date-fns";
import { useLanguage } from "../context/LanguageContext";
import { useCurrency } from "../context/CurrencyContext";
import { useAuth } from "../context/AuthContext";

import { useCart } from "../context/CartContext";

interface Props {
  activity: Activity;
  allActivities: Activity[];
  categories: any[];
}

const INIT: BookingState = {
  activity: null, date: null, timeSlot: "",
  adults: 2, children: 0,
  fullName: "", email: "", phone: "",
};

export default function BookingClient({ activity, allActivities, categories }: Props) {
  const router = useRouter();
  const { t } = useLanguage();
  const { convert } = useCurrency();
  const { user, isLoading: authLoading } = useAuth();
  const { updateBookingProgress, getBookingProgress, isInCart, addToCart } = useCart();

  // Restore progress from cart if available
  const savedProgress = getBookingProgress(activity.id || (activity as any)._id);
  const [booking, setBooking] = useState<BookingState>(() => {
    if (savedProgress) {
      return {
        ...INIT,
        activity,
        date: savedProgress.date ? new Date(savedProgress.date) : null,
        timeSlot: savedProgress.timeSlot || "",
        adults: savedProgress.adults || 2,
        children: savedProgress.children || 0,
        fullName: savedProgress.fullName || "",
        email: savedProgress.email || "",
        phone: savedProgress.phone || "",
        selectedTransportIndex: savedProgress.selectedTransportIndex,
        pickupLocation: savedProgress.pickupLocation || "",
        dropoffLocation: savedProgress.dropoffLocation || "",
        specialRequirements: savedProgress.specialRequirements || "",
      };
    }
    return { ...INIT, activity };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [globalOps, setGlobalOps] = useState<any>(null);
  const [bookingStep, setBookingStep] = useState(savedProgress?.step || 1);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Auto-save booking progress to cart whenever state changes
  useEffect(() => {
    const actId = activity.id || (activity as any)._id;
    if (!isInCart(actId)) {
      // Auto-add to cart when user enters booking flow
      addToCart(activity);
    }
    updateBookingProgress(actId, {
      step: bookingStep,
      date: booking.date ? (booking.date as Date).toISOString() : null,
      timeSlot: booking.timeSlot,
      adults: booking.adults,
      children: booking.children,
      fullName: booking.fullName,
      email: booking.email,
      phone: booking.phone,
      selectedTransportIndex: booking.selectedTransportIndex,
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      specialRequirements: booking.specialRequirements,
    });
  }, [booking, bookingStep]);

  // Strict Login Rule
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error("Login Required", { description: "Please sign in to your elite account to reserve experiences." });
        router.replace("/");
      } else {
        setIsCheckingAuth(false);
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetch("/api/global-operations")
      .then(res => res.json())
      .then(data => { if (data.success) setGlobalOps(data.operation); })
      .catch(console.error);
  }, []);

  const handleUpdate = useCallback((update: Partial<BookingState>) => {
    if (update.date && globalOps?.blackoutDates) {
       const selDate = startOfDay(new Date(update.date));
       const blackout = globalOps.blackoutDates.find((b: any) => 
          b.isActive && isSameDay(new Date(b.date), selDate) && (b.applyToAll || b.targetActivityIds.includes(activity.id))
       );
       if (blackout) {
          toast.error("Date Unavailable", { description: blackout.reason || "Operations are paused for this date." });
          return;
       }
    }
    setBooking(prev => ({ ...prev, ...update }));
  }, [globalOps, activity.id]);

  if (authLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[var(--s0)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={40} className="animate-spin text-[var(--g300)] mx-auto" />
          <p className="text-[0.6rem] uppercase tracking-[0.3em] font-black text-[var(--g300)]">Verifying Clearance</p>
        </div>
      </div>
    );
  }

  const calculateTotal = () => {
    if (!activity) return 0;
    
    // 1. Base Price with Dynamic Surcharges
    let baseA = activity.price;
    let baseC = typeof activity.childPrice === 'number' ? activity.childPrice : (baseA * 0.5);
    
    let markupA = 0;
    let markupC = 0;
    
    if (booking.date) {
      const selDate = startOfDay(new Date(booking.date));
      
      // 1a. Activity-Specific Rules
      if (activity.pricingRules) {
        const rule = activity.pricingRules.find(r => {
          if (r.type === 'date' && r.date) return isSameDay(new Date(r.date), selDate);
          if (r.type === 'weekend') return selDate.getDay() === 0 || selDate.getDay() === 6;
          return false;
        });
        if (rule) {
          markupA += rule.adjustment;
          markupC += rule.adjustment;
        }
      }

      // 1b. Global Operational Rules
      if (globalOps?.pricingRules) {
        const gRule = globalOps.pricingRules.find((r: any) => {
          if (!r.isActive) return false;
          if (!r.applyToAll && !r.targetActivityIds?.includes(activity.id)) return false;
          
          if (r.type === 'date' && r.date) return isSameDay(new Date(r.date), selDate);
          if (r.type === 'weekend') return selDate.getDay() === 0 || selDate.getDay() === 6;
          if (r.type === 'fixed_holiday' && r.date) {
            const [m, d] = r.date.split('-');
            return (selDate.getMonth() + 1) === parseInt(m) && selDate.getDate() === parseInt(d);
          }
          return false;
        });
        if (gRule) {
          if (gRule.adjustmentType === 'fixed') {
            markupA += gRule.adjustment;
            markupC += gRule.adjustment;
          } else {
            markupA += (baseA * (gRule.adjustment / 100));
            markupC += (baseC * (gRule.adjustment / 100));
          }
        }
      }
    }
    
    // 2. Guest Calculation (Explicit Child Price supported)
    const adultFinal = baseA + markupA;
    const childFinal = baseC + markupC;
    let subtotal = (adultFinal * booking.adults) + (childFinal * booking.children);
    
    // 3. Transport Configuration
    if (booking.selectedTransportIndex !== undefined && activity.transportOptions) {
      const opt = activity.transportOptions[booking.selectedTransportIndex];
      if (opt) {
        subtotal += opt.isPerPerson ? (opt.price * (booking.adults + booking.children)) : opt.price;
      }
    }
    
    // 4. Promotions
    if (!booking.promoCode) return subtotal;

    const { discountType, discountValue } = booking.promoCode;
    if (discountType === 'percentage') {
      return subtotal * (1 - discountValue / 100);
    }
    return Math.max(0, subtotal - discountValue);
  };

  const finalPriceValue = calculateTotal();

  const handleConfirm = async (method: 'card' | 'wallet') => {
    if (!activity || !booking.activity || !booking.date) return;
    const isPackage = activity.isPackage || activity.category === 'signature-journeys';
    if (!isPackage && !booking.timeSlot) return;
    setIsSubmitting(true);
    
    const resSubtotal = activity.price * (booking.adults + booking.children * 0.5);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...booking,
          activityId: booking.activity.id,
          activityTitle: booking.activity.title,
          paymentMethod: method,
          totalPrice: finalPriceValue,
          pickupLocation: booking.pickupLocation,
          dropoffLocation: booking.dropoffLocation,
          specialRequirements: booking.specialRequirements,
          // Package-specific fields
          ...(isPackage && {
            isPackageBooking: true,
            packageStartDate: booking.packageStartDate || booking.date,
            packageEndDate: booking.packageEndDate,
            durationDays: (activity as any).durationDays,
            durationNights: (activity as any).durationNights,
          }),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Booking failed");
      }
      const data = await res.json();
      
      setConfirmation({
        bookingId: data.booking.bookingId,
        activity: booking.activity,
        date: booking.date!,
        timeSlot: booking.timeSlot,
        adults: booking.adults,
        children: booking.children,
        totalPrice: data.booking.totalPrice,
        fullName: booking.fullName,
        email: booking.email,
        phone: booking.phone,
        pickupLocation: booking.pickupLocation,
        dropoffLocation: booking.dropoffLocation,
        specialRequirements: booking.specialRequirements,
        selectedTransportIndex: booking.selectedTransportIndex,
      });
      
      toast.success("Booking Confirmed!");
    } catch (err: any) {
      toast.error("Booking Issue", { description: err.message || "An unexpected error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <>
        <Navbar hasBooking={false} categories={categories} />
        <div className="pt-24 min-h-screen bg-[var(--s0)]">
          <BookingSuccess confirmation={confirmation} onNewBooking={() => router.push("/")} />
        </div>
        <Footer categories={categories} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--s0)]">
      <Navbar hasBooking={false} categories={categories} />
      
      <main className="pt-24 pb-32 lg:pb-20 px-5 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <BookingSteps
              booking={booking}
              activities={allActivities}
              totalPrice={finalPriceValue} 
              onUpdate={handleUpdate}
              onConfirm={handleConfirm}
              onCancel={() => router.back()}
              isSubmitting={isSubmitting}
              globalOps={globalOps}
              externalStep={bookingStep}
              onStepChange={setBookingStep}
            />
          </div>
          
          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-32">
              <BookingSidebar 
                booking={booking} 
                totalPrice={finalPriceValue}
                onRemove={() => router.push("/")}
                onEdit={() => setBookingStep(1)} 
                globalOps={globalOps}
                activities={allActivities}
              />
            </div>
          </div>
        </div>
      </main>

      {/* ── Sticky Mobile Checkout Bar (visible only on mobile) ── */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{ 
          background: "linear-gradient(180deg, transparent, var(--s1) 20%)",
          paddingTop: "20px"
        }}
      >
        <div 
          className="mx-3 mb-3 p-4 rounded-2xl flex items-center justify-between gap-4"
          style={{ 
            background: "var(--s2)", 
            border: "1px solid var(--bg1)", 
            boxShadow: "0 -8px 32px rgba(0,0,0,0.6)",
            backdropFilter: "blur(20px)"
          }}
        >
          <div>
            <p className="text-[0.6rem] uppercase tracking-widest font-bold" style={{ color: "var(--t4)" }}>{t('grid.total') || 'Total'}</p>
            <p className="fd text-xl font-medium gold-text leading-tight">
              {convert(finalPriceValue)}
            </p>
          </div>
          <button 
            onClick={() => {
              const el = document.querySelector('[data-booking-continue]');
              if (el) (el as HTMLButtonElement).click();
            }}
            className="btn-g px-6 py-3 text-[0.75rem] shadow-[0_8px_24px_rgba(212,150,42,0.3)]"
          >
            {t('booking.continue')}
          </button>
        </div>
      </div>

      <Footer categories={categories} />
    </div>
  );
}
