"use client";

import { useState, useCallback, useEffect } from "react";
import { Activity, BookingState } from "./types";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ActivityGrid from "./components/ActivityGrid";
import ComboBuilder from "./components/ComboBuilder";
import Footer from "./components/Footer";
import AIPlannerWidget from "./components/AIPlannerWidget";
import Newsletter from "./components/Newsletter";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

const INIT: BookingState = {
  activity: null, date: null, timeSlot: "",
  adults: 2, children: 0,
  fullName: "", email: "", phone: "",
};

interface HomeClientProps {
  initialActivities: Activity[];
  initialCategories: any[];
}

export default function HomeClient({ initialActivities, initialCategories }: HomeClientProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [booking, setBooking]           = useState<BookingState>(INIT);
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const [isComboBuilderOpen, setIsComboBuilderOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const searchParams = useSearchParams();

  // --- Modal Scrolling Control ---
  useEffect(() => {
    if (expandedId || isComboBuilderOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [expandedId, isComboBuilderOpen]);

  // --- URL State Sync ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let changed = false;

    if (expandedId) {
      if (params.get('view') !== expandedId) { params.set('view', expandedId); changed = true; }
    } else {
      if (params.has('view')) { params.delete('view'); changed = true; }
    }

    if (changed) {
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [expandedId]);

  useEffect(() => {
    const catQuery = searchParams.get('category');
    if (catQuery) {
      setCurrentCategory(catQuery);
    }
  }, [searchParams]);

  // --- Wishlist Fetch (uses AuthContext user, no duplicate /api/auth/me call) ---
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!currentUser) {
        setWishlist([]);
        return;
      }
      try {
        const wishlistRes = await fetch('/api/wishlist');
        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json();
          setWishlist(wishlistData.wishlist || []);
        }
      } catch (e) { console.error("Wishlist error", e); }
    };
    fetchWishlist();
  }, [currentUser]);

  const handleToggleWishlist = async (activityId: string) => {
    if (!currentUser) {
      window.dispatchEvent(new Event("openAuthModal"));
      return;
    }
    const isWishlisted = wishlist.includes(activityId);
    setWishlist(prev => isWishlisted ? prev.filter(id => id !== activityId) : [...prev, activityId]);
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId }),
      });
    } catch (error) {
      console.error("Wishlist toggle error", error);
    }
  };

  const handleQuickSelect = (query: string) => {
    const cleanQuery = query.toLowerCase();
    const catMatch = [
      { key: "combo", label: "Super Savers" },
      ...initialCategories.map(c => ({ key: c.slug, label: c.name }))
    ].find(c => c.key.toLowerCase() === cleanQuery || c.label.toLowerCase() === cleanQuery);

    if (catMatch) {
      setCurrentCategory(catMatch.key);
      const el = document.getElementById("experiences");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Fallback if section not present (though on home it should be)
        window.location.href = `/?category=${encodeURIComponent(catMatch.key)}#experiences`;
      }
      return;
    }

    const act = initialActivities.find(a => 
      a.title.toLowerCase().includes(cleanQuery) || 
      cleanQuery.includes(a.title.toLowerCase())
    );

    if (act) {
      document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentCategory("all");
      setTimeout(() => {
        handleExpand(act.id);
        const card = document.getElementById(`card-${act.id}`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    } else {
      setCurrentCategory("all");
      document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSelect = useCallback((activity: Activity) => {
    if (!currentUser) {
      window.dispatchEvent(new Event("openAuthModal"));
      return;
    }
    router.push(`/book/${activity.id}`);
  }, [currentUser, router]);

  const handleExpand = useCallback((id: string | null) => {
    setExpandedId((p) => (p === id ? null : id));
  }, []);

  const handleBookCombo = useCallback((selectedActivities: Activity[], totalDiscountedPrice: number) => {
    if (!currentUser) {
      setIsComboBuilderOpen(false);
      window.dispatchEvent(new Event("openAuthModal"));
      return;
    }
    const titles = selectedActivities.map(a => a.title).join(" + ");

    // Merge all unique time slots from selected activities
    const allTimeSlots = Array.from(
      new Set(selectedActivities.flatMap(a => a.timeSlots || []))
    ).sort();

    // Sum of original/retail prices (for struck-out display only)
    const retailTotal = selectedActivities.reduce((sum, a) => sum + (a.originalPrice || a.price), 0);
    // Sum of current prices (what customers actually pay individually)
    const currentTotal = selectedActivities.reduce((sum, a) => sum + a.price, 0);
    
    // Discount tier: 2 items = 10%, 3+ = 20%
    const discountTier = selectedActivities.length >= 3 ? 0.20 : selectedActivities.length >= 2 ? 0.10 : 0;

    // Calculate total duration
    const totalDuration = selectedActivities.map(a => a.duration).join(" + ");

    // Create a synthetic combo activity with all necessary fields
    const comboActivity: Activity = {
      id: "custom-combo",
      title: `Custom Super Saver Combo`,
      subtitle: titles,
      shortDescription: `${selectedActivities.length} premium experiences bundled with ${Math.round(discountTier * 100)}% savings`,
      fullDescription: titles,
      price: Math.round(currentTotal * (1 - discountTier)), // per-person combo price from current prices
      originalPrice: retailTotal, // original/retail total for struck-out display
      isComboDeal: true,
      duration: totalDuration,
      rating: 5,
      image: selectedActivities[0]?.image || "/images/hero_bg_4k_1772860004560.png",
      gallery: selectedActivities.map(a => a.image).filter(Boolean),
      category: "combo",
      highlights: selectedActivities.map(a => a.title),
      included: selectedActivities.flatMap(a => a.included || []),
      timeSlots: allTimeSlots, // merged from all activities
      maxGroupSize: Math.min(...selectedActivities.map(a => a.maxGroupSize || 20)),
      isActive: true,
    };

    // Create per-activity combo items for independent scheduling
    const comboItems = selectedActivities.map(a => ({
      activityId: a.id,
      date: null,
      timeSlot: "",
    }));

    const comboState = {
      titles,
      activities: selectedActivities,
      totalPrice: Math.round(currentTotal * (1 - discountTier)),
      retailTotal,
      currentTotal,
      discountTier,
      comboActivity,
      comboItems,
    };
    sessionStorage.setItem("pending_combo", JSON.stringify(comboState));
    setIsComboBuilderOpen(false);
    router.push("/book/custom");
  }, [currentUser, router]);

  return (
    <main style={{ minHeight: "100vh", background: "var(--s0)" }}>
      <Navbar
        hasBooking={!!booking.activity}
        categories={initialCategories}
        activities={initialActivities}
        onSelectCategory={handleQuickSelect}
      />
      <Hero />
      <section id="experiences">
        <ActivityGrid
          activities={initialActivities}
          categories={initialCategories}
          expandedId={expandedId}
          selectedId={null}
          wishlistItems={wishlist}
          initialCategory={currentCategory}
          onExpand={handleExpand}
          onSelectPackage={handleSelect}
          onToggleWishlist={handleToggleWishlist}
          onOpenComboBuilder={() => setIsComboBuilderOpen(true)}
        />
      </section>
      <ComboBuilder 
        isOpen={isComboBuilderOpen}
        onClose={() => setIsComboBuilderOpen(false)}
        activities={initialActivities}
        onBookCombo={handleBookCombo}
      />
      <Newsletter />
      <Footer categories={initialCategories} onSelectActivity={handleQuickSelect} />
      <AIPlannerWidget onSelectActivity={(id) => {
        const card = document.getElementById(`card-${id}`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
        handleExpand(id);
      }} />
    </main>
  );
}
