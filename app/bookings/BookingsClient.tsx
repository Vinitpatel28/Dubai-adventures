"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { 
  Calendar, Clock, Users, Package, ExternalLink, 
  ArrowLeft, CreditCard, MapPin, Mail, 
  CalendarCheck, Loader2, Save, X, Edit3, ShieldCheck,
  Plus, Minus, Info, AlertTriangle, ChevronRight,
  Ticket, History, Wallet, User as UserIcon, Ship, Sparkles
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "sonner";
import { BookingsSkeleton } from "../components/Skeleton";
import AIPlannerWidget from "../components/AIPlannerWidget";
import ComboImageGallery from "../components/ComboImageGallery";

interface Booking {
  _id: string;
  bookingId: string;
  activityId: string;
  activityTitle: string;
  date: string;
  timeSlot: string;
  adults: number;
  children: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  fullName: string;
  email: string;
  phone: string;
  comboItems?: any[];
  comboGallery?: string[];
  category?: string;
}

export default function BookingsClient({ 
  initialBookings = [], 
  categories = [], 
  isAuthenticated = false 
}: { 
  initialBookings: any[], 
  categories: any[], 
  isAuthenticated: boolean 
}) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(initialBookings[0] || null);
  const [activityDetails, setActivityDetails] = useState<any>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editSlot, setEditSlot] = useState("");
  const [editAdults, setEditAdults] = useState(1);
  const [editChildren, setEditChildren] = useState(0);
  const [updating, setUpdating] = useState(false);

  // Filter state
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchText, setSearchText] = useState("");

  const CATEGORY_MAP = [
    { key: "all", label: "All Experiences", emoji: "✨" },
    { key: "combo", label: "Super Savers", emoji: "🎟️" },
    { key: "desert", label: "Desert Safari", emoji: "🏜️" },
    { key: "atv", label: "ATV & Buggy", emoji: "🏎️" },
    { key: "luxury", label: "Premium Luxury", emoji: "✨" },
    { key: "sky", label: "Sky & Balloon", emoji: "🎈" },
    { key: "cruises", label: "Dhow Cruises", emoji: "🚢" },
    { key: "theme-parks", label: "Theme Parks", emoji: "🎢" },
    { key: "water", label: "Yacht & Water", emoji: "⚓" },
    { key: "fishing", label: "Deep Sea Fishing", emoji: "🎣" },
    { key: "helicopter", label: "Helicopter", emoji: "🚁" },
    { key: "scuba", label: "Scuba Diving", emoji: "🤿" },
  ];

  const dynamicCategoryFilters = [
    { key: 'all', label: 'All Experiences', emoji: '✨' },
    { key: 'combo', label: 'Super Savers', emoji: '🎟️' },
    ...categories.map((c: any) => ({
      key: c.slug,
      label: c.name,
      emoji: CATEGORY_MAP.find(m => m.key === c.slug)?.emoji || (c.icon || '✦')
    }))
  ];

  const STATUS_FILTERS = ['all', 'confirmed', 'pending', 'pending_cancellation', 'cancelled'];

  // Filtered bookings
  const filteredBookings = bookings.filter(b => {
    // Search
    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      const match = (b.activityTitle || '').toLowerCase().includes(s) ||
                    (b.bookingId || '').toLowerCase().includes(s) ||
                    (b.fullName || '').toLowerCase().includes(s);
      if (!match) return false;
    }
    // Category
    if (filterCategory !== 'all') {
      // For combo, we check the category or if it's a custom-combo
      if (filterCategory === 'combo') {
        if (b.category !== 'combo' && b.activityId !== 'custom-combo') return false;
      } else {
        if (b.category !== filterCategory) return false;
      }
    }
    // Status
    if (filterStatus !== 'all') {
      if ((b.status || 'pending').toLowerCase() !== filterStatus) return false;
    }
    return true;
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Identification required");
      window.dispatchEvent(new Event('openAuthModal'));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedBooking) {
      setActivityDetails(null);
      fetchActivityDetails(selectedBooking.activityId, selectedBooking.activityTitle);
    }
  }, [selectedBooking]);

  const fetchActivityDetails = async (id: string, title?: string) => {
    try {
      const query = title ? `?title=${encodeURIComponent(title)}` : '';
      const res = await fetch(`/api/activities/${id}${query}`);
      if (res.ok) {
        const data = await res.json();
        setActivityDetails(data.activity);
      }
    } catch (err) {
      console.error("Activity detail fetch fail", err);
    }
  };

  const handleUpdate = async () => {
    if (!selectedBooking) return;
    try {
      setUpdating(true);
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          date: editDate,
          timeSlot: editSlot,
          adults: editAdults,
          children: editChildren
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success("Booking updated successfully");
      setIsEditing(false);
      setSelectedBooking(data.booking);
      setBookings(prev => prev.map(b => b._id === data.booking._id ? data.booking : b));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const startEdit = () => {
    if (!selectedBooking) return;
    setEditDate(new Date(selectedBooking.date).toISOString().split('T')[0]);
    setEditSlot(selectedBooking.timeSlot);
    setEditAdults(selectedBooking.adults);
    setEditChildren(selectedBooking.children);
    setIsEditing(true);
  };

  const getPricePreview = () => {
    if (!activityDetails) return selectedBooking?.totalPrice || 0;
    return (editAdults * activityDetails.price) + (editChildren * activityDetails.price * 0.5);
  };

  const handleRequestCancellation = async () => {
    if (!selectedBooking) return;
    
    const confirm = window.confirm("Are you sure you want to request cancellation for this adventure?");
    if (!confirm) return;

    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: selectedBooking._id })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Cancellation Requested");
        setBookings(prev => prev.map(b => b._id === selectedBooking._id ? { ...b, status: 'pending_cancellation' } : b));
        setSelectedBooking((prev: any) => prev ? { ...prev, status: 'pending_cancellation' } : null);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--s0)] text-[var(--t1)] selection:bg-[var(--g300)]/30">
      <Navbar categories={categories} hasBooking={false} forceDark={false} />

      {/* ── Header ── */}
      <header className="pt-28 pb-10 border-b border-[var(--bw1)] bg-[var(--s1)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="anim-fade-up">
                 <p className="text-[0.65rem] uppercase tracking-[0.25em] text-[var(--g300)] font-bold mb-2">Member Dashboard</p>
                 <h1 className="fd text-3xl md:text-4xl text-[var(--t1)] font-normal">Your <br className="sm:hidden"/> <span className="gold-text">Bookings</span></h1>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--bw1)] border border-[var(--bw2)]">
                 <History size={14} className="text-[var(--g300)]"/>
                 <span className="text-[0.65rem] uppercase tracking-widest font-bold text-[var(--t2)]">{filteredBookings.length} of {bookings.length} Bookings</span>
              </div>
           </div>

           {/* ── Filter Bar ── */}
           {bookings.length > 0 && (
             <div className="mt-6 space-y-6 anim-fade-up" style={{ animationDelay: "100ms" }}>
                {/* Category Filters (Dynamic & Matching Home Page) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 -mx-2 px-2 no-scrollbar">
                  {dynamicCategoryFilters.map(c => (
                    <button
                      key={c.key}
                      onClick={() => setFilterCategory(c.key)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[0.7rem] font-bold tracking-tight transition-all whitespace-nowrap border ${
                        filterCategory === c.key
                          ? "bg-[rgba(212,150,42,0.15)] border-[var(--g300)] text-[var(--g200)] shadow-[0_8px_20px_rgba(0,0,0,0.2)]"
                          : "bg-[var(--bw1)] border-[var(--bw2)] text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--s2)]"
                      }`}
                    >
                      <span className="text-sm">{c.emoji}</span> 
                      {c.label}
                    </button>
                  ))}
                </div>

                {/* Status + Search Row */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-1.5 bg-[var(--bw1)] p-1 rounded-full border border-[var(--bw2)] overflow-x-auto no-scrollbar">
                    {STATUS_FILTERS.map(s => (
                      <button
                        key={s}
                        onClick={() => setFilterStatus(s)}
                        className={`px-4 py-2 rounded-full text-[0.6rem] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                          filterStatus === s
                            ? "bg-[var(--g300)] text-[#06040A] shadow-sm"
                            : "text-[var(--t4)] hover:text-[var(--t2)]"
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search by ID, activity name or traveler..."
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      className="w-full bg-[var(--bw1)] border border-[var(--bw2)] rounded-full py-2.5 pl-10 pr-4 text-[0.75rem] text-[var(--t1)] placeholder:text-[var(--t4)] focus:outline-none focus:border-[var(--g300)]/50 transition-all font-medium"
                    />
                    <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--t4)]" />
                  </div>
                </div>
             </div>
           )}
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
        {loading ? (
          <BookingsSkeleton />
        ) : bookings.length === 0 ? (
          <div className="text-center py-24 rounded-3xl bg-[var(--s1)] border border-[var(--bw1)] anim-fade-up">
            <div className="w-20 h-20 rounded-full bg-[var(--bw2)] flex items-center justify-center mx-auto mb-6">
               <Package size={30} className="text-[var(--g300)]" />
            </div>
            <h2 className="fd text-2xl text-[var(--t1)] mb-2">Empty Itinerary</h2>
            <p className="text-[0.75rem] text-[var(--t3)] max-w-xs mx-auto mb-8 leading-relaxed uppercase tracking-wider">
              No adventures recorded in your current timeline.
            </p>
            <a href="/#experiences" className="btn-g">
              Explore Dubai <ArrowLeft size={14} className="rotate-180" />
            </a>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-24 rounded-3xl bg-[var(--s1)] border border-[var(--bw1)] anim-fade-up">
            <Package size={32} className="text-[var(--t4)] mx-auto mb-4 opacity-20" />
            <h3 className="fd text-xl text-[var(--t2)] mb-2 uppercase tracking-widest">No matching explorations</h3>
            <p className="text-[0.75rem] text-[var(--t4)] mb-8 uppercase tracking-widest font-bold">Try adjusting filters to expand your scope</p>
            <button
              onClick={() => { setFilterCategory('all'); setFilterStatus('all'); setSearchText(''); }}
              className="px-8 py-3 rounded-full text-[0.65rem] font-black uppercase tracking-widest border border-[var(--bw2)] text-[var(--t3)] hover:text-[var(--t1)] hover:bg-[var(--bw2)] transition-all"
            >
              Reset Overview <Sparkles size={14} className="ml-2 inline"/>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* ── Sidebar: Booking List ── */}
            <div className="lg:col-span-4 space-y-3 lg:sticky lg:top-32 max-h-[calc(100vh-140px)] overflow-y-auto luxury-scroll pr-2 pb-10">
               {filteredBookings.map((b) => (
                 <button
                   key={b._id}
                   onClick={() => { setSelectedBooking(b); setIsEditing(false); }}
                   className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 group ${
                     selectedBooking?._id === b._id 
                     ? 'bg-[var(--s2)] border-[var(--g300)]/40 shadow-lg' 
                     : 'bg-[var(--s1)] border-[var(--bw1)] hover:border-[var(--bw2)] hover:bg-[var(--s2)]'
                   }`}
                 >
                   <div className="flex justify-between items-start mb-3">
                      <span className="text-[0.55rem] font-bold font-mono text-[var(--g300)] bg-[var(--g300)]/10 px-2 py-0.5 rounded border border-[var(--g300)]/20">
                        #{b.bookingId}
                      </span>
                      <span className={`text-[0.55rem] uppercase tracking-[0.1em] font-black px-2 py-0.5 rounded-full ${
                        b.status === 'confirmed' ? 'text-emerald-400 bg-emerald-400/10' : 
                        b.status === 'pending_cancellation' ? 'text-amber-400 bg-amber-400/10' : 'text-gray-400 bg-gray-400/10'
                      }`}>
                         {b.status.replace('_', ' ')}
                      </span>
                   </div>
                   <h4 className={`text-[0.85rem] font-bold uppercase tracking-wide leading-snug mb-3 transition-colors ${selectedBooking?._id === b._id ? 'text-[var(--t1)]' : 'text-[var(--t2)] group-hover:text-[var(--t1)]'}`}>
                     {b.activityTitle}
                   </h4>
                   <div className="flex items-center gap-4 text-[0.6rem] text-[var(--t4)] font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Calendar size={10}/> {format(new Date(b.date), "dd MMM yy")}</span>
                      <span className="flex items-center gap-1.5"><Users size={10}/> {b.adults + b.children} PAX</span>
                   </div>
                 </button>
               ))}
            </div>

            {/* ── Main Panel: Booking Details ── */}
            <div className="lg:col-span-8 anim-fade-up">
               {selectedBooking ? (
                 <div className="bg-[var(--s1)] border border-[var(--bw1)] rounded-3xl overflow-hidden shadow-2xl">
                    
                    <div className="h-[400px] sm:h-[450px] relative overflow-hidden group">
                       {selectedBooking?.comboGallery && selectedBooking.comboGallery.length > 0 ? (
                         <div className="w-full h-full group-hover:scale-105 transition-transform duration-[1.5s] ease-out origin-center">
                           <ComboImageGallery images={selectedBooking.comboGallery} size="hero" className="w-full h-full" />
                         </div>
                       ) : activityDetails?.image ? (
                         <Image 
                           src={activityDetails.image} 
                           alt=""
                           fill 
                           className="object-cover object-center group-hover:scale-105 transition-transform duration-[1.5s] ease-out origin-center" 
                         />
                       ) : (
                         <div className="w-full h-full relative">
                            <Image 
                              src="/images/hero_bg_4k_1772860004560.png" 
                              alt="Dubai Adventures"
                              fill 
                              className="object-cover grayscale-[20%] opacity-40 group-hover:scale-105 transition-transform duration-[1.5s] ease-out origin-center" 
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <div className="text-center">
                                  <Ship size={64} className="text-[var(--bw2)] mx-auto mb-4 animate-pulse" />
                                  <p className="text-[0.6rem] uppercase tracking-[0.3em] text-[var(--t4)] font-bold">Synchronizing Details...</p>
                               </div>
                            </div>
                         </div>
                       )}
                       
                       <div className="absolute bottom-10 left-10 right-10 z-10 pointer-events-none">
                          <div className="anim-fade-up">
                            <p className="inline-block px-3 py-1 rounded-full bg-black/50 border border-white/20 text-[0.6rem] uppercase tracking-[0.4em] font-black text-[var(--g300)] mb-4 backdrop-blur-md shadow-lg">
                              Adventure Dossier
                            </p>
                            <h2 
                               className="fd text-3xl sm:text-5xl font-normal leading-tight" 
                               style={{ color: "#ffffff", textShadow: "0px 4px 20px rgba(0,0,0,0.9), 0px 2px 5px rgba(0,0,0,0.8)" }}
                            >
                               {selectedBooking.activityTitle}
                            </h2>
                          </div>
                       </div>
                    </div>

                    <div className="p-8 sm:p-10">
                       <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                          
                          {/* Info Column */}
                          <div className="md:col-span-7 space-y-8">
                             {isEditing ? (
                               <div className="space-y-6 slide-up">
                                  <div className="p-6 rounded-2xl bg-[var(--bw4)] border border-[var(--bw1)] space-y-5">
                                     <div className="flex items-center gap-3 mb-2">
                                        <Edit3 size={14} className="text-[var(--g300)]" />
                                         <span className="text-[0.65rem] uppercase tracking-[0.2em] font-black text-[var(--t2)]">Edit Booking</span>
                                     </div>
                                     
                                     <div className="space-y-4">
                                        <div>
                                            <label className="f-label">Trip Date</label>
                                           <input 
                                             type="date" 
                                             value={editDate}
                                             onChange={(e) => setEditDate(e.target.value)}
                                             className="f-input"
                                           />
                                        </div>
                                        <div>
                                           <label className="f-label">Time Window</label>
                                           <div className="grid grid-cols-2 gap-2">
                                              {(activityDetails?.timeSlots?.length > 0 ? activityDetails.timeSlots : ["Morning", "Evening"]).map((slot: string) => (
                                                <button 
                                                  key={slot}
                                                  onClick={() => setEditSlot(slot)}
                                                  className={`py-3 rounded-full text-[0.65rem] font-bold uppercase border transition-all ${
                                                    editSlot === slot 
                                                    ? 'bg-[var(--g300)] border-[var(--g300)] text-[#06040A]' 
                                                    : 'bg-[var(--bw4)] border-[var(--bw1)] text-[var(--t3)] hover:border-[var(--bw2)]'
                                                  }`}
                                                >
                                                  {slot}
                                                </button>
                                              ))}
                                           </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                           <div>
                                              <label className="f-label">Adults</label>
                                              <div className="flex items-center justify-between bg-[var(--bw4)] border border-[var(--bw2)] rounded-full p-1.5">
                                                 <button onClick={() => setEditAdults(Math.max(1, editAdults - 1))} className="w-8 h-8 rounded-full hover:bg-[var(--bw2)] flex items-center justify-center transition-colors"><Minus size={14}/></button>
                                                 <span className="text-[0.9rem] font-bold">{editAdults}</span>
                                                 <button onClick={() => setEditAdults(editAdults + 1)} className="w-8 h-8 rounded-full hover:bg-[var(--bw2)] flex items-center justify-center transition-colors"><Plus size={14}/></button>
                                              </div>
                                           </div>
                                           <div>
                                              <label className="f-label">Children</label>
                                              <div className="flex items-center justify-between bg-[var(--bw4)] border border-[var(--bw2)] rounded-full p-1.5">
                                                 <button onClick={() => setEditChildren(Math.max(0, editChildren - 1))} className="w-8 h-8 rounded-full hover:bg-[var(--bw2)] flex items-center justify-center transition-colors"><Minus size={14}/></button>
                                                 <span className="text-[0.9rem] font-bold">{editChildren}</span>
                                                 <button onClick={() => setEditChildren(editChildren + 1)} className="w-8 h-8 rounded-full hover:bg-[var(--bw2)] flex items-center justify-center transition-colors"><Plus size={14}/></button>
                                              </div>
                                           </div>
                                        </div>
                                     </div>
                                  </div>

                                  <div className="flex gap-3">
                                     <button onClick={() => setIsEditing(false)} className="flex-1 py-4 rounded-full border border-[var(--bw2)] text-[0.65rem] font-black uppercase tracking-widest hover:bg-[var(--bw4)] transition-all">Cancel</button>
                                     <button 
                                       onClick={handleUpdate} 
                                       disabled={updating}
                                       className="flex-[2] py-4 rounded-full bg-[var(--t1)] text-[var(--s0)] text-[0.65rem] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                     >
                                       {updating ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} Commit Changes
                                     </button>
                                  </div>
                               </div>
                             ) : (
                               <div className="space-y-10 group/details">
                                  
                                  {/* Schedule Block */}
                                  <div className="grid grid-cols-2 gap-8">
                                     <div>
                                        <p className="f-label flex items-center gap-2"><Calendar size={12}/> Trip Date</p>
                                        <p className="text-[0.9rem] font-bold uppercase tracking-wide text-[var(--t1)]">
                                           {format(new Date(selectedBooking.date), "EEEE, dd MMM yyyy")}
                                        </p>
                                     </div>
                                     <div>
                                        <p className="f-label flex items-center gap-2"><Clock size={12}/> Window</p>
                                        <p className="text-[0.9rem] font-bold uppercase tracking-wide text-[var(--t1)]">
                                           {selectedBooking.timeSlot}
                                        </p>
                                     </div>
                                  </div>

                                  {/* Group Block */}
                                  <div>
                                      <p className="f-label flex items-center gap-2"><Users size={12}/> Group Size</p>
                                     <div className="flex items-center gap-6 mt-1">
                                        <div className="flex items-center gap-2.5">
                                           <span className="text-xl font-bold text-[var(--t1)]">{selectedBooking.adults}</span>
                                           <span className="text-[0.6rem] text-[var(--t3)] font-black uppercase tracking-widest font-mono">Adults</span>
                                        </div>
                                        {selectedBooking.children > 0 && (
                                          <div className="flex items-center gap-2.5">
                                           <span className="text-xl font-bold text-[var(--t1)]">{selectedBooking.children}</span>
                                           <span className="text-[0.6rem] text-[var(--t3)] font-black uppercase tracking-widest font-mono">Children</span>
                                        </div>
                                        )}
                                     </div>
                                  </div>

                                  {/* Primary Traveler Block */}
                                  <div className="pt-8 border-t border-[var(--bw1)] grid grid-cols-2 gap-6">
                                     <div>
                                        <p className="f-label">Traveler Name</p>
                                        <p className="text-[0.85rem] font-medium text-[var(--t2)]">{selectedBooking.fullName}</p>
                                     </div>
                                     <div>
                                         <p className="f-label">Email</p>
                                        <p className="text-[0.85rem] font-medium text-[var(--t2)] truncate overflow-hidden">{selectedBooking.email}</p>
                                     </div>
                                  </div>

                                  <div className="space-y-3">
                                    <button onClick={startEdit} className="btn-o w-full justify-center">
                                       Reschedule Adventure <Edit3 size={13}/>
                                    </button>
                                    
                                    {/* 2026 Concierge AI Lock period check */}
                                    {(() => {
                                       const hoursToTrip = (new Date(selectedBooking.date).getTime() - Date.now()) / 3600000;
                                       if (hoursToTrip < 24 && hoursToTrip > -24 && selectedBooking.status === 'confirmed') {
                                          return (
                                             <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center space-y-3 animate-in fade-in zoom-in duration-700">
                                                <div className="flex items-center justify-center gap-2 text-amber-500/80">
                                                   <AlertTriangle size={14} />
                                                   <span className="text-[0.6rem] uppercase tracking-[0.2em] font-black">Rescheduling Locked</span>
                                                </div>
                                                <p className="text-[0.7rem] text-[var(--t3)] leading-relaxed px-4">This expedition is within the 24h lock period. Negotiate with Concierge AI for exceptions.</p>
                                                <button 
                                                   onClick={() => {
                                                      const btn = document.querySelector('#ai-planner-btn') as HTMLElement;
                                                      if(btn) btn.click();
                                                   }}
                                                   className="text-[0.7rem] font-black uppercase tracking-widest text-white underline decoration-[#D4962A] underline-offset-4 hover:text-[#D4962A] transition-colors"
                                                >
                                                   Negotiate with Concierge AI
                                                </button>
                                             </div>
                                          );
                                       }
                                       return null;
                                    })()}
                                    
                                    {!['cancelled', 'pending_cancellation', 'refunded'].includes(selectedBooking.status) && (
                                      <button 
                                        onClick={handleRequestCancellation} 
                                        className="w-full py-3.5 rounded-xl border border-red-500/20 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 text-[0.65rem] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                                      >
                                         Request Cancellation <X size={13}/>
                                      </button>
                                    )}
                                  </div>

                               </div>
                             )}
                          </div>

                          {/* Transaction Card Column */}
                          <div className="md:col-span-5 space-y-6">
                             
                             {/* Payment Card */}
                             <div className="p-6 rounded-2xl bg-[var(--s2)] border border-[var(--bw1)] shadow-inner">
                                <div className="flex items-center justify-between mb-8">
                                   <Wallet size={20} className="text-[var(--g300)]" />
                                   <div className="text-right">
                                      <p className="text-[0.55rem] font-black uppercase tracking-widest text-[var(--t4)] mb-1">Status</p>
                                      <span className="text-[0.6rem] font-black uppercase tracking-widest text-emerald-400">{selectedBooking.paymentStatus}</span>
                                   </div>
                                </div>
                                <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[var(--t3)] mb-2">Total Amount</p>
                                <div className="flex items-baseline gap-2">
                                   <span className="text-[0.8rem] font-bold text-[var(--g300)]">AED</span>
                                   <span className="text-3xl font-black text-[var(--t1)]">
                                      {isEditing ? getPricePreview().toLocaleString() : selectedBooking.totalPrice.toLocaleString()}
                                   </span>
                                </div>
                                {isEditing && (
                                   <p className="mt-4 text-[0.6rem] text-amber-400 flex items-center gap-1.5 uppercase font-black">
                                      <AlertTriangle size={10}/> Rates may adjust based on configuration
                                   </p>
                                 )}
                             </div>

                             {/* Security Dossier */}
                             <div className="p-6 rounded-2xl bg-[var(--bw5)] border border-[var(--bw1)] space-y-4">
                                <div className="flex items-center gap-3">
                                   <ShieldCheck size={16} className="text-emerald-500/60" />
                                   <span className="text-[0.65rem] font-black uppercase tracking-widest text-[var(--t2)]">Important Info</span>
                                </div>
                                <ul className="space-y-2.5">
                                   {[
                                      "Official Voucher required at entry",
                                      "Identification link mandatory",
                                      "Rescheduling closes 24h prior",
                                      "Refunds subject to policy review"
                                   ].map(item => (
                                     <li key={item} className="flex items-start gap-2 text-[0.65rem] text-[var(--t4)] leading-relaxed uppercase font-medium">
                                        <ChevronRight size={10} className="mt-0.5 text-[var(--g500)]" />
                                        {item}
                                     </li>
                                   ))}
                                </ul>
                             </div>

                          </div>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="h-full min-h-[500px] flex items-center justify-center rounded-3xl bg-[var(--s1)] border border-dashed border-[var(--bw2)] anim-fade-in">
                    <div className="text-center opacity-20">
                       <p className="text-[0.65rem] uppercase tracking-[0.4em] font-black text-[var(--t3)] mb-4">Select an expedition</p>
                       <Package size={28} className="mx-auto" />
                    </div>
                 </div>
               )}
            </div>

          </div>
        )}
      </section>

      <div className="gold-line mt-20" />
      <Footer categories={categories} />
      <AIPlannerWidget />

      <style jsx global>{`
        .luxury-scroll::-webkit-scrollbar { width: 3px; }
        .luxury-scroll::-webkit-scrollbar-thumb { background: var(--bw2); border-radius: 99px; }
        .luxury-scroll::-webkit-scrollbar-thumb:hover { background: var(--g400); }
        
        .anim-fade-up { animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .anim-fade-in { animation: fadeIn 0.8s ease both; }
        .slide-up { animation: slideU 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }

        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: var(--calendar-invert);
          opacity: 0.4;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: 0.8; }
      `}</style>
    </main>
  );
}
