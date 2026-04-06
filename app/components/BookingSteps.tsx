"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check, Zap, Loader2, Lock } from "lucide-react";
import { BookingState, Activity } from "../types";
import { toast } from "sonner";
import { STEPS as BASE_STEPS } from "./booking/BookingUtils";
import { useLanguage } from "../context/LanguageContext";

// Import Refactored Steps
import Step1Schedule from "./booking/Step1Schedule";
import Step2Guests from "./booking/Step2Guests";
import Step3GuestInfo from "./booking/Step3GuestInfo";
import Step4Review from "./booking/Step4Review";
import Step5Payment from "./booking/Step5Payment";

interface Props {
  booking: BookingState;
  activities: Activity[];
  totalPrice: number;
  onUpdate: (u: Partial<BookingState>) => void;
  onConfirm: (method: 'card' | 'wallet') => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  globalOps?: any;
  externalStep?: number;
  onStepChange?: (step: number) => void;
}

export default function BookingSteps({
  booking,
  activities,
  totalPrice,
  onUpdate,
  onConfirm,
  onCancel,
  isSubmitting,
  globalOps,
  externalStep,
  onStepChange
}: Props) {
  const { t } = useLanguage();
  const [step, setStepInternal] = useState(externalStep ?? 1);
  const [activeComboIndex, setActiveComboIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const [cardDetails, setCardDetails] = useState({
    name: '',
    number: '',
    expiry: '',
    cvv: ''
  });

  const contentRef = useRef<HTMLDivElement>(null);

  const setStep = (s: number) => {
    setStepInternal(s);
    onStepChange?.(s);
  };

  useEffect(() => {
    if (booking.fullName && !cardDetails.name) {
      setCardDetails(prev => ({ ...prev, name: booking.fullName.toUpperCase() }));
    }
  }, [booking.fullName]);

  useEffect(() => {
    if (externalStep !== undefined && externalStep !== step) {
      setStepInternal(externalStep);
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [externalStep]);

  const validate = () => {
    if (step === 1) {
      const isPackage = booking.activity?.isPackage || booking.activity?.category === 'signature-journeys';
      
      if (isPackage) {
        // Packages only need a start date — timeSlot is auto-set to "Package Start"
        if (!booking.date) {
          toast.error("Departure Date Required", {
            description: "Please select your journey departure date to continue.",
          });
          return false;
        }
      } else if (booking.comboItems && booking.comboItems.length > 0) {
        const firstIncompleteIdx = booking.comboItems.findIndex(item => !item.date || !item.timeSlot);
        if (firstIncompleteIdx !== -1) {
          const activityName = booking.activity?.subtitle?.split(" + ")[firstIncompleteIdx] || `Exp ${firstIncompleteIdx + 1}`;
          toast.error(`Incomplete Schedule`, {
            description: `Please select a date and time slot for ${activityName}.`,
          });
          setActiveComboIndex(firstIncompleteIdx);
          return false;
        }
        // Auto-sync: set the main booking date/timeSlot from combo items for API compatibility
        if (!booking.date && booking.comboItems[0]?.date) {
          onUpdate({ 
            date: booking.comboItems[0].date,
            timeSlot: booking.comboItems.map(i => i.timeSlot).join(", ")
          });
        }
      } else {
        if (!booking.date || !booking.timeSlot) {
          toast.error("Selection Required", {
            description: "Please choose a travel date and your preferred time slot to continue.",
          });
          return false;
        }
      }
    }
    if (step === 2 && booking.adults < 1) return false;
    if (step === 3) {
      const e: Record<string, string> = {};
      if (!booking.fullName.trim()) e.fullName = "Full name is required";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!booking.email.trim() || !emailRegex.test(booking.email)) e.email = "Valid email required";
      // Strict 10-digit rule as requested by user
      const digitsOnly = booking.phone.replace(/\D/g, "");
      if (!booking.phone.trim() || digitsOnly.length !== 10) {
        e.phone = "Phone must be exactly 10 digits";
      }
      if (!booking.pickupLocation?.trim()) e.pickupLocation = "Pickup address is required";
      setErrors(e);
      if (Object.keys(e).length > 0) {
        toast.error("Required Information", { description: "Please complete the contact and logistics details." });
        return false;
      }
    }
    if (step === 5 && paymentMethod === 'card') {
      const e: Record<string, string> = {};
      if (!cardDetails.name.trim()) e.cardName = "Cardholder name required";
      if (!/^\d{16}$/.test(cardDetails.number.replace(/\s+/g, ""))) e.cardNumber = "Invalid card number";
      if (!/^\d{2}\s*\/\s*\d{2}$/.test(cardDetails.expiry)) e.expiry = "Use MM/YY";
      if (!/^\d{3,4}$/.test(cardDetails.cvv)) e.cvv = "Invalid CVV";
      setErrors(e);
      if (Object.keys(e).length > 0) {
        toast.error("Payment Details Invalid", { description: "Please check the highlighted fields." });
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validate()) return;
    setErrors({});
    setStep(Math.min(step + 1, 5));
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const goBack = () => {
    setStep(Math.max(step - 1, 1));
  };

  useEffect(() => {
    const handlePaymentComplete = (e: any) => {
      onConfirm(e.detail.method);
    };
    window.addEventListener('paymentComplete', handlePaymentComplete);
    return () => window.removeEventListener('paymentComplete', handlePaymentComplete);
  }, [onConfirm]);

  const progress = ((step - 1) / 4) * 100;

  return (
    <div className="w-full text-[var(--t1)]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Zap size={14} className="text-[var(--g300)]" />
          <p className="text-[0.65rem] tracking-[0.28em] uppercase font-black text-[var(--g300)]">
            {t('booking.secure_portal')}
          </p>
        </div>
        <h2 className="fd leading-[1.08] text-[var(--t1)] text-3xl sm:text-4xl font-light">
          {booking.activity?.title}
        </h2>
      </div>

      {/* Progress & Steps */}
      <div className="mb-8">
        <div className="h-[2px] rounded-full mb-4 bg-[var(--bw1)] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[var(--g500)] to-[var(--g200)] transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between">
          {BASE_STEPS.map((s) => (
            <div key={s.n} className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[0.78rem] font-semibold transition-all ${step > s.n ? "bg-[var(--g300)] text-black" : step === s.n ? "bg-[var(--g300)]/20 border-2 border-[var(--g300)] text-[var(--g200)]" : "bg-[var(--bw1)] border border-[var(--bw2)] text-[var(--t4)]"
                }`}>
                {step > s.n ? <Check size={14} /> : s.n}
              </div>
              <span className={`text-[0.58rem] tracking-wide uppercase hidden sm:block ${step >= s.n ? "text-[var(--g300)]" : "text-[var(--t4)]"}`}>
                {t(`booking.${s.key}`)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div ref={contentRef} className="rounded-2xl overflow-hidden bg-[var(--s2)] border border-[var(--bw1)]">
        <div key={step} className="a-scale">
          {step === 1 && <Step1Schedule booking={booking} onUpdate={onUpdate} activeComboIndex={activeComboIndex} setActiveComboIndex={setActiveComboIndex} globalOps={globalOps} activities={activities} />}
          {step === 2 && <Step2Guests booking={booking} onUpdate={onUpdate} />}
          {step === 3 && <Step3GuestInfo booking={booking} onUpdate={onUpdate} errors={errors} />}
          {step === 4 && <Step4Review booking={booking} onUpdate={onUpdate} totalPrice={totalPrice} activities={activities} />}
          {step === 5 && <Step5Payment booking={booking} onUpdate={onUpdate} cardDetails={cardDetails} setCardDetails={setCardDetails} errors={errors} setErrors={setErrors} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} totalPrice={totalPrice} />}
        </div>

        {/* Navigation Footer */}
        <div className="px-6 sm:px-8 py-4 flex items-center justify-between border-t border-[var(--bw1)] bg-[var(--bw4)]">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button onClick={goBack} className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[0.71rem] uppercase tracking-wide font-medium bg-[var(--s1)] border border-[var(--bw2)] text-[var(--t2)] hover:bg-[var(--s2)] transition-all">
                <ChevronLeft size={13} /> {t('booking.back')}
              </button>
            )}
            <button onClick={onCancel} className="text-[0.7rem] text-[var(--t4)] hover:text-[var(--t2)] transition-colors px-2">{t('booking.cancel')}</button>
          </div>

          <button onClick={step < 5 ? goNext : () => validate() && onConfirm(paymentMethod)} disabled={isSubmitting} className="btn-g px-7 py-3 flex items-center gap-2 group">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : step === 5 ? <Lock size={15} /> : null}
            {isSubmitting ? t('booking.securing') : step === 4 ? t('booking.proceed_payment') : step === 5 ? t('booking.pay_confirm') : t('booking.continue')}
            {!isSubmitting && step < 5 && <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      </div>
    </div>
  );
}
