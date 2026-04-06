import React from "react";
import { CreditCard, Smartphone, Lock, User, ShieldCheck } from "lucide-react";
import { VisualCreditCard, FormField } from "./BookingComponents";
import { BookingState } from "../../types";
import StripePayment from "./StripePayment";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../context/CurrencyContext";

interface Step5Props {
  booking: BookingState;
  onUpdate: (u: Partial<BookingState>) => void;
  cardDetails: any;
  setCardDetails: (d: any) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  paymentMethod: 'card' | 'wallet';
  setPaymentMethod: (m: 'card' | 'wallet') => void;
  totalPrice: number;
}

export default function Step5Payment({ booking, onUpdate, cardDetails, setCardDetails, errors, setErrors, paymentMethod, setPaymentMethod, totalPrice }: Step5Props) {
  const { t } = useLanguage();
  const { convert } = useCurrency();
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-10 pb-4 border-b border-white/5">
        <p className="text-[0.65rem] tracking-[0.22em] uppercase font-semibold mb-1" style={{ color: "var(--g300)" }}>
          ✦ {t('booking.step_05')}
        </p>
        <h3 className="fd text-xl font-medium">{t('booking.final_secure_ledger')}</h3>
      </div>

      <div className="flex items-center gap-2 mb-10 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setPaymentMethod('card')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all duration-300 ${
            paymentMethod === 'card' 
              ? 'bg-[var(--g300)]/10 border-[var(--g300)] scale-105 shadow-[var(--shg)]' 
              : 'bg-[var(--s1)] border-[var(--bw1)] hover:bg-[var(--s2)] opacity-60'
          }`}
        >
          <CreditCard size={18} className={paymentMethod === 'card' ? 'text-[var(--g300)]' : 'text-[var(--t3)]'} />
          <span className={`text-[0.7rem] uppercase tracking-widest font-black ${paymentMethod === 'card' ? 'text-[var(--g200)]' : 'text-[var(--t3)]'}`}>{t('booking.credit_debit')}</span>
        </button>
        <button
          onClick={() => setPaymentMethod('wallet')}
          className={`flex-1 min-w-[160px] flex items-center justify-center gap-3 py-4 rounded-2xl border-2 transition-all duration-300 ${
            paymentMethod === 'wallet' 
              ? 'bg-[var(--g300)]/10 border-[var(--g300)] scale-105 shadow-[var(--shg)]' 
              : 'bg-[var(--s1)] border-[var(--bw1)] hover:bg-[var(--s2)] opacity-60'
          }`}
        >
          <Smartphone size={18} className={paymentMethod === 'wallet' ? 'text-[var(--g300)]' : 'text-[var(--t3)]'} />
          <span className={`text-[0.7rem] uppercase tracking-widest font-black ${paymentMethod === 'wallet' ? 'text-[var(--g200)]' : 'text-[var(--t3)]'}`}>{t('booking.digital_wallet')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        {paymentMethod === 'card' ? (
          <div className="xl:col-span-12">
            <div className="flex flex-col space-y-12">
              {/* Card + Info Row */}
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-16">
                 {/* Left: The Visual Card */}
                 <div className="flex-shrink-0 animate-in slide-in-from-left duration-700">
                    <VisualCreditCard details={cardDetails} />
                 </div>
                 
                 {/* Right: The Data Entry Portal */}
                 <div className="flex-1 w-full p-8 rounded-[2.5rem] bg-[var(--bw3)]/40 border border-white/5 space-y-6 shadow-2xl backdrop-blur-sm animate-in slide-in-from-right duration-700">
                    <FormField 
                      label={t('booking.cardholder_name')} 
                      icon={<User size={13} />} 
                      type="text" 
                      placeholder="NAME ON CARD" 
                      value={cardDetails.name} 
                      error={errors.cardName}
                      onChange={(v) => {
                        setCardDetails({ ...cardDetails, name: v.toUpperCase() });
                        if (errors.cardName) setErrors({ ...errors, cardName : "" });
                      }} 
                    />
                    
                    <div className="space-y-6">
                      <FormField 
                        label={t('booking.card_number')} 
                        icon={<CreditCard size={13} />} 
                        type="text" 
                        placeholder="0000 0000 0000 0000" 
                        value={cardDetails.number} 
                        error={errors.cardNumber}
                        onChange={(v) => {
                          const digits = v.replace(/\D/g, "").slice(0, 16);
                          const formatted = digits.match(/.{1,4}/g)?.join(" ") || digits;
                          setCardDetails({ ...cardDetails, number: formatted });
                          if (errors.cardNumber) setErrors({ ...errors, cardNumber : "" });
                        }} 
                      />
                      
                      <div className="grid grid-cols-2 gap-6">
                         <FormField 
                           label={t('booking.expires')} 
                           icon={<Lock size={12} />} 
                           type="text" 
                           placeholder="MM / YY" 
                           value={cardDetails.expiry} 
                           error={errors.expiry}
                           onChange={(v) => {
                             const cleaned = v.replace(/\D/g, "").slice(0, 4);
                             let formatted = cleaned;
                             if (cleaned.length > 2) formatted = `${cleaned.slice(0, 2)} / ${cleaned.slice(2)}`;
                             setCardDetails({ ...cardDetails, expiry: formatted });
                             if (errors.expiry) setErrors({ ...errors, expiry : "" });
                           }} 
                         />
                         <FormField 
                           label={t('booking.cvv')} 
                           icon={<ShieldCheck size={13} />} 
                           type="password" 
                           placeholder="000" 
                           value={cardDetails.cvv} 
                           error={errors.cvv}
                           onChange={(v) => {
                             const cleaned = v.replace(/\D/g, "").slice(0, 4);
                             setCardDetails({ ...cardDetails, cvv: cleaned });
                             if (errors.cvv) setErrors({ ...errors, cvv : "" });
                           }} 
                         />
                      </div>
                    </div>
                 </div>
              </div>

              {/* Matrix Mode / Stripe Row (Underneath or Unified) */}
              <div className="pt-6 border-t border-white/5">
                 <StripePayment 
                    amount={totalPrice} 
                    bookingId={booking.activity?.id} 
                    email={booking.email} 
                    onSuccess={(method: 'card' | 'wallet', transactionId: string) => {
                      onUpdate({ paymentMethod: method, transactionId });
                      window.dispatchEvent(new CustomEvent('paymentComplete', { detail: { method, transactionId } }));
                    }}
                 />
              </div>
            </div>
          </div>
        ) : (
          <div className="xl:col-span-12">
            <div className="p-8 sm:p-14 rounded-[2.5rem] bg-gradient-to-br from-[var(--bw5)] to-transparent border border-white/[0.04] flex flex-col items-center justify-center gap-10 min-h-[400px] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--g300)]/5 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="text-center space-y-4 relative z-10">
                <div className="w-20 h-20 rounded-full bg-[var(--g300)]/10 mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(212,150,42,0.15)] animate-pulse">
                  <Smartphone size={36} className="text-[var(--g300)]" />
                </div>
                <h4 className="fd text-2xl font-medium tracking-wide" style={{ color: "var(--t1)" }}>{t('booking.express_checkout')}</h4>
                <p className="text-sm max-w-sm mx-auto leading-relaxed font-light" style={{ color: "var(--t3)" }}>
                  Seamlessly finalize your adventure dossiers using authenticated biometrics and encrypted mobile tokens.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md relative z-10">
                 <button className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-all group theme-force-dark">
                    <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center text-black font-bold text-[0.6rem]">Pay</div>
                    <span className="text-[0.75rem] font-bold text-white tracking-widest uppercase group-hover:scale-105 transition-transform">Apple Pay</span>
                 </button>
                 <button className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-black border border-white/10 hover:border-white/20 transition-all group theme-force-dark">
                    <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center text-black font-bold text-[0.6rem]">G</div>
                    <span className="text-[0.75rem] font-bold text-white tracking-widest uppercase group-hover:scale-105 transition-transform">Google Pay</span>
                 </button>
              </div>

               <p className="text-[0.6rem] uppercase tracking-[0.3em] font-black" style={{ color: "var(--t3)" }}>{t('booking.biometric_verification')}</p>
            </div>
          </div>
        )}

        <div className="xl:col-span-12 mt-6">
           <div className="p-8 rounded-[2rem] bg-[var(--s1)] border border-[var(--bw1)] flex flex-col md:flex-row justify-between items-center gap-8 shadow-sm">
              <div className="space-y-1 text-center md:text-left">
                 <p className="text-[0.6rem] uppercase tracking-widest text-[var(--g300)] font-black">{t('booking.secure_payment_total')}</p>
                 <p className="fd text-5xl font-medium gold-text">{convert(totalPrice)}</p>
              </div>
               <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-4 max-w-sm">
                  <ShieldCheck size={28} className="text-emerald-500/80 dark:text-emerald-400 mt-1 flex-shrink-0" />
                  <p className="text-[0.65rem] leading-relaxed font-medium" style={{ color: "var(--t2)" }}>
                    {t('booking.secure_payment_info')}
                  </p>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}
