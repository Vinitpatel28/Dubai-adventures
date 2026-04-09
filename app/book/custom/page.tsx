"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Activity, BookingState, BookingConfirmation } from "../../types";
import Navbar from "../../components/Navbar";
import BookingSteps from "../../components/BookingSteps";
import BookingSidebar from "../../components/BookingSidebar";
import BookingSuccess from "../../components/BookingSuccess";
import Footer from "../../components/Footer";
import { toast } from "sonner";

const INIT: BookingState = {
  activity: null, date: null, timeSlot: "",
  adults: 2, children: 0,
  fullName: "", email: "", phone: "",
};

export default function CustomBookingPage() {
  const router = useRouter();
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [comboActivities, setComboActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [booking, setBooking] = useState<BookingState>(INIT);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [discountTier, setDiscountTier] = useState(0.10);

  useEffect(() => {
    const saved = sessionStorage.getItem("pending_combo");
    if (!saved) {
      router.push("/");
      return;
    }

    const loadData = async () => {
      try {
        const [actRes, catRes] = await Promise.all([
          fetch(`/api/activities`),
          fetch(`/api/categories`)
        ]);
        
        const actData = await actRes.json();
        const catData = await catRes.json();
        
        setActivities(actData.activities || []);
        setCategories(catData.categories || []);
        
        const comboData = JSON.parse(saved);
        const selectedActivities: Activity[] = comboData.activities || [];
        setComboActivities(selectedActivities);
        setDiscountTier(comboData.discountTier || (selectedActivities.length >= 3 ? 0.20 : 0.10));

        // Use the pre-built synthetic combo activity if available, otherwise build one
        let comboActivity = comboData.comboActivity;
        if (!comboActivity) {
          const allTimeSlots = Array.from(
            new Set(selectedActivities.flatMap((a: Activity) => a.timeSlots || []))
          ).sort() as string[];
          const retailTotal = selectedActivities.reduce((sum: number, a: Activity) => sum + (a.originalPrice || a.price), 0);
          const currentTotal = selectedActivities.reduce((sum: number, a: Activity) => sum + a.price, 0);
          const tier = selectedActivities.length >= 3 ? 0.20 : selectedActivities.length >= 2 ? 0.10 : 0;
          
          comboActivity = {
            id: "custom-combo",
            title: "Custom Super Saver Combo",
            subtitle: selectedActivities.map((a: Activity) => a.title).join(" + "),
            shortDescription: `${selectedActivities.length} experiences bundled`,
            fullDescription: selectedActivities.map((a: Activity) => a.title).join(" + "),
            price: Math.round(currentTotal * (1 - tier)),
            originalPrice: retailTotal,
            isComboDeal: true,
            duration: selectedActivities.map((a: Activity) => a.duration).join(" + "),
            rating: 5,
            image: selectedActivities[0]?.image || "/images/hero_bg_4k_1772860004560.png",
            gallery: selectedActivities.map((a: Activity) => a.image).filter(Boolean),
            category: "combo",
            highlights: selectedActivities.map((a: Activity) => a.title),
            included: selectedActivities.flatMap((a: Activity) => a.included || []),
            timeSlots: allTimeSlots,
            maxGroupSize: Math.min(...selectedActivities.map((a: Activity) => a.maxGroupSize || 20)),
            isActive: true,
          };
        }

        // Build per-activity combo items 
        const comboItems = comboData.comboItems || selectedActivities.map((a: Activity) => ({
          activityId: a.id,
          date: null,
          timeSlot: "",
        }));

        setBooking(prev => ({ 
          ...prev, 
          activity: comboActivity,
          comboItems,
        }));
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to load custom combo data:", err);
        setLoading(false);
      }
    };
    
    loadData();
  }, [router]);

  const handleUpdate = useCallback((update: Partial<BookingState>) => {
    setBooking(prev => ({ ...prev, ...update }));
  }, []);

  // Proper combo price calculation using individual activity prices
  const calculateComboTotal = useMemo(() => {
    if (!booking.activity || comboActivities.length === 0) return 0;
    
    // Sum individual activity prices × guests
    let baseTotal = 0;
    for (const act of comboActivities) {
      const adultPrice = act.price;
      const childPrice = typeof act.childPrice === 'number' ? act.childPrice : adultPrice * 0.5;
      baseTotal += (adultPrice * booking.adults) + (childPrice * booking.children);
    }
    
    // Apply combo discount
    const discountedTotal = baseTotal * (1 - discountTier);
    
    // Apply promo code if present
    if (booking.promoCode) {
      const { discountType, discountValue } = booking.promoCode;
      if (discountType === 'percentage') {
        return Math.round(discountedTotal * (1 - discountValue / 100));
      }
      return Math.max(0, Math.round(discountedTotal - discountValue));
    }
    
    return Math.round(discountedTotal);
  }, [comboActivities, booking.adults, booking.children, discountTier, booking.promoCode]);

  const handleConfirm = async (method: 'card' | 'wallet') => {
    if (!booking.activity || !booking.fullName) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...booking,
          activityId: "custom-combo",
          activityTitle: booking.activity.title,
          paymentMethod: method,
          totalPrice: calculateComboTotal,
          comboItems: booking.comboItems,
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
        date: booking.comboItems?.[0]?.date || booking.date || new Date(),
        timeSlot: booking.comboItems?.map(i => i.timeSlot).filter(Boolean).join(", ") || "Multi-Slot",
        adults: booking.adults,
        children: booking.children,
        totalPrice: data.booking.totalPrice,
        fullName: booking.fullName,
        email: booking.email,
        phone: booking.phone,
      });
      
      sessionStorage.removeItem("pending_combo");
      toast.success("Combo Booking Confirmed!");
    } catch (err: any) {
      toast.error("Process Failed", { description: err.message || "Please try again or contact support." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--s0)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[var(--g300)]" />
      </div>
    );
  }

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
      
      <main className="pt-24 pb-20 px-5 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <BookingSteps
              booking={booking}
              activities={activities}
              totalPrice={calculateComboTotal}
              onUpdate={handleUpdate}
              onConfirm={handleConfirm}
              onCancel={() => router.back()}
              isSubmitting={isSubmitting}
            />
          </div>
          
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <BookingSidebar 
                booking={booking} 
                totalPrice={calculateComboTotal}
                onRemove={() => router.push("/")}
                onEdit={() => {}}
                activities={activities}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer categories={categories} />
    </div>
  );
}

