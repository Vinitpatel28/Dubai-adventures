"use client";

import React, { useState } from "react";

import { Send, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";

export default function Newsletter() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter Subscriber",
          email: email,
          type: "Newsletter",
          message: "Subscription request from website footer/section",
          phone: "N/A"
        }),
      });

      if (res.ok) {
        setIsSubmitted(true);
        toast.success("Welcome to the Elite Circle!", {
          description: "Check your inbox for exclusive Dubai insights."
        });
        setEmail("");
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Subscription failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden bg-[var(--s1)] border-t border-white/5">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--g300)]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--g300)]/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center relative z-10">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--g300)]/10 border border-[var(--g300)]/20">
            <Sparkles size={12} className="text-[var(--g300)]" />
            <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-[var(--g300)]">{t('newsletter.badge')}</span>
          </div>

          <div className="space-y-4">
            <h2 className="fd text-4xl sm:text-6xl font-light text-[var(--t1)] leading-tight">
              Stay in the <span className="gold-text italic">Know</span>
            </h2>
            <p className="text-[var(--t2)] text-[1rem] font-light max-w-lg mx-auto leading-relaxed">
              {t('newsletter.subtitle')}
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubscribe} className="max-w-xl mx-auto relative group mt-10">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-1.5 rounded-2xl sm:rounded-full bg-[var(--s1)] border border-[var(--bw2)] focus-within:border-[var(--g300)]/50 focus-within:bg-[var(--s2)] transition-all duration-500 shadow-2xl backdrop-blur-sm">
                <input
                  type="email"
                  required
                  placeholder={t('newsletter.placeholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent border-none py-4 px-8 text-[0.95rem] text-[var(--t1)] focus:outline-none placeholder:text-[var(--t3)]"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-g !py-4 !px-10 !text-[0.65rem] !rounded-xl sm:!rounded-full flex items-center justify-center gap-3 disabled:opacity-50 transition-all group/btn"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span className="font-black uppercase tracking-[0.2em]">{t('newsletter.button')}</span>
                      <Send size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="py-8 flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-700">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-white font-medium text-lg uppercase tracking-widest">{t('newsletter.success')}</h3>
                <p className="text-white/40 text-xs uppercase tracking-tighter">Welcome to the inner circle</p>
              </div>
            </div>
          )}

          <div className="pt-4">
            <p className="text-[0.6rem] text-white/10 uppercase tracking-[0.4em] font-bold">
              {t('newsletter.privacy')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
