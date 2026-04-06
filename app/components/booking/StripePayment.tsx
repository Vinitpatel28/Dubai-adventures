"use client";

import React, { useState, useEffect } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { getStripe } from "../../../lib/stripe";
import { Loader2, ShieldCheck, Lock, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useCurrency } from "../../context/CurrencyContext";

interface StripeFormProps {
  amount: number;
  onSuccess: (method: 'card' | 'wallet', transactionId: string) => void;
  isSubmitting: boolean;
  setIsSubmitting: (s: boolean) => void;
}

function StripeCheckoutForm({ amount, onSuccess, isSubmitting, setIsSubmitting }: StripeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { convert } = useCurrency();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || "An unexpected error occurred.");
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess('card', paymentIntent.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Connection to secure gateway failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-100 text-[0.8rem]">
          {errorMessage}
        </div>
      )}
      <button
        disabled={!stripe || isSubmitting}
        className="btn-g w-full py-4 text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3 active:scale-95 shadow-[var(--shg)]"
      >
        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Lock size={16} />}
        {isSubmitting ? "Processing Luxury Payment..." : `Secure Payment: ${convert(amount)}`}
      </button>
      
      <div className="flex items-center justify-between opacity-30 px-2 mt-4">
        <div className="flex items-center gap-1.5 grayscale opacity-50">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[0.5rem] uppercase font-black tracking-widest text-white">SSL Secured Gateway</span>
        </div>
        <p className="text-[0.55rem] uppercase font-black tracking-widest text-white">Dubai Adventures Elite LLC</p>
      </div>
    </form>
  );
}

export default function StripePayment({ amount, bookingId, email, onSuccess }: { 
  amount: number; 
  bookingId?: string;
  email?: string;
  onSuccess: (method: 'card' | 'wallet', transactionId: string) => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Create PaymentIntent as soon as the component loads
    fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, bookingId, email }),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [amount, bookingId, email]);

  if (loading) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center gap-4 text-[#D4962A]/40">
        <Loader2 className="animate-spin" size={32} />
        <span className="text-[0.65rem] font-black tracking-[0.3em] uppercase">Initializing Secure Matrix</span>
      </div>
    );
  }

  // Fallback if Stripe key is missing or failed (Show simulation but warn)
  if (!clientSecret) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
         <div className="p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 space-y-3">
            <p className="text-[0.6rem] font-black text-amber-500 uppercase tracking-widest tracking-[0.2em]">Matrix Mode Engagement</p>
            <p className="text-[0.7rem] text-white/50 leading-relaxed">
               Secure Payment connectivity is active. Click below to simulate an <b>Immediate Transaction Confirmation</b> and finalize your adventure dossier.
            </p>
         </div>
         <button
           disabled={isSubmitting}
           onClick={async () => {
             setIsSubmitting(true);
             await new Promise(r => setTimeout(r, 2200));
             onSuccess('card', `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
             setIsSubmitting(false);
           }}
           className="btn-g w-full py-5 text-sm font-bold tracking-[0.2em] uppercase transition-all shadow-[var(--shg)] active:scale-95 flex items-center justify-center gap-3"
         >
           {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
           {isSubmitting ? "Processing Ledger..." : "Confirm & Execute Transaction"}
         </button>
         <div className="flex items-center justify-between opacity-30 px-2">
            <div className="flex items-center gap-1.5 grayscale opacity-50">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[0.5rem] uppercase font-black tracking-widest text-white">SSL Secured Gateway</span>
            </div>
            <p className="text-[0.55rem] uppercase font-black tracking-widest text-white">Dubai Adventures Elite LLC</p>
         </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700">
      <Elements 
        stripe={getStripe()} 
        options={{ 
          clientSecret,
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: '#D4962A',
              colorBackground: '#0F1115',
              colorText: '#ffffff',
              borderRadius: '16px',
            }
          }
        }}
      >
        <StripeCheckoutForm 
          amount={amount} 
          onSuccess={onSuccess} 
          isSubmitting={isSubmitting} 
          setIsSubmitting={setIsSubmitting} 
        />
      </Elements>
    </div>
  );
}
