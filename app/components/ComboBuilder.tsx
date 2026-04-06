"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Activity } from "../types";
import { X, Check, Plus, Minus, Zap, Shield, Sparkles } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  onBookCombo: (selectedActivities: Activity[], totalDiscountedPrice: number) => void;
}

export default function ComboBuilder({ isOpen, onClose, activities, onBookCombo }: Props) {
  const { convert } = useCurrency();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const standardActivities = useMemo(() => 
    activities.filter(a => !a.isComboDeal && a.isActive),
  [activities]);

  const selectedActivities = useMemo(() => 
    standardActivities.filter(a => selectedIds.includes(a.id)),
  [standardActivities, selectedIds]);

  const originalTotal = useMemo(() => 
    selectedActivities.reduce((sum, a) => sum + (a.originalPrice || a.price), 0),
  [selectedActivities]);

  // Dynamic Combo Discount: 
  // 2 items = 10% off
  // 3+ items = 20% off
  const discountTier = selectedIds.length >= 3 ? 0.20 : selectedIds.length >= 2 ? 0.10 : 0;
  const savings = originalTotal * discountTier;
  const finalPrice = originalTotal - savings;

  if (!isOpen) return null;

  const toggleActivity = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : (prev.length < 4 ? [...prev, id] : prev)
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={onClose} 
      />

      {/* Main Container */}
      <div 
        className="relative w-full max-w-5xl h-[85vh] flex flex-col rounded-3xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
        style={{ border: "1px solid var(--bw1)", background: "var(--s1)" }}
      >
        {/* Header */}
        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-[var(--bw1)] bg-[var(--bw1)]">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-1.5 rounded-lg bg-[var(--g300)]/10">
                <Sparkles size={18} className="text-[var(--g300)]" />
              </div>
              <h2 className="fd text-2xl font-medium">Combo <em className="not-italic gold-text">Builder</em></h2>
            </div>
            <p className="text-[0.75rem] text-white/40 uppercase tracking-[0.2em] font-bold">
              Select 2+ Experiences to Unlock Exclusive Savings
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[var(--bw1)] flex items-center justify-center hover:bg-[var(--bw2)] transition-colors"
          >
            <X size={20} className="text-[var(--t2)]" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {standardActivities.map((activity) => {
              const isSelected = selectedIds.includes(activity.id);
              return (
                <div 
                  key={activity.id}
                  onClick={() => toggleActivity(activity.id)}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-[var(--g300)] scale-[0.98]' : 'hover:scale-[1.02] border border-white/5'
                  }`}
                  style={{ background: "var(--s2)" }}
                >
                  <div className="relative h-40">
                    <Image src={activity.image} alt={activity.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    
                    {/* Select Indicator */}
                    <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-[var(--g300)] text-[#06040A] scale-110' : 'bg-black/50 backdrop-blur-md text-white border border-white/20'
                    }`}>
                      {isSelected ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-[0.65rem] uppercase tracking-widest text-[var(--g400)] font-bold mb-1">{activity.category}</p>
                    <h3 className="fd text-[0.9rem] font-medium text-white mb-2 leading-tight">{activity.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-[0.8rem] font-bold text-white/90">{convert(activity.price)}</span>
                      <span className="text-[0.65rem] text-white/40 italic">{activity.duration}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer / Summary Bar */}
        <div 
          className="p-6 sm:p-8 border-t border-white/10"
          style={{ background: "linear-gradient(180deg, rgba(212,150,42,0.05), rgba(212,150,42,0.12))" }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Selected Pills */}
            <div className="flex flex-wrap gap-3 flex-1 min-w-0">
              {selectedIds.length === 0 ? (
                <div className="text-white/30 text-[0.8rem] italic flex items-center gap-2">
                  <Plus size={14} /> Tap activities above to add them to your combo...
                </div>
              ) : (
                selectedActivities.map(a => (
                  <div 
                    key={a.id} 
                    className="flex items-center gap-2.5 bg-white/5 border border-white/10 pl-2 pr-1 py-1 rounded-full animate-in slide-in-from-left-2"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 relative">
                      <Image src={a.image} alt={a.title} fill className="object-cover" />
                    </div>
                    <span className="text-[0.7rem] font-medium text-white/80 max-w-[120px] truncate">{a.title}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleActivity(a.id); }}
                      className="w-5 h-5 rounded-full bg-[var(--bw1)] flex items-center justify-center hover:bg-[var(--bw2)]"
                    >
                      <Minus size={10} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Price & Action */}
            <div className="flex items-center gap-8 pl-8 border-l border-white/10">
              <div className="text-right">
                {savings > 0 && (
                  <div className="mb-2 flex flex-col items-end">
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[0.6rem] font-black text-emerald-400 uppercase tracking-widest animate-pulse">
                      Premium Bundle Savings Unlocked
                    </div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-widest text-[#6EE7A0] mt-1">
                      <Zap size={10} className="inline mr-1" /> You Saved {convert(Math.round(savings))}
                    </p>
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-white/30 line-through text-[0.85rem]">{convert(originalTotal)}</span>
                  <span className="fd text-3xl font-medium gold-text">{convert(Math.round(finalPrice))}</span>
                </div>
              </div>
              <button 
                disabled={selectedIds.length < 2}
                onClick={() => onBookCombo(selectedActivities, Math.round(finalPrice))}
                className={`btn-g px-8 py-3.5 ${selectedIds.length < 2 ? 'opacity-30 grayscale cursor-not-allowed' : 'btn-pop'}`}
              >
                Bundle & Save <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
