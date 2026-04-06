"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'General Inquiry',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error();
      
      setIsSubmitted(true);
      toast.success("Message Sent!", {
        description: "Our team will get back to you shortly."
      });
    } catch {
      toast.error("Failed to Send", {
        description: "Please try again or contact us via WhatsApp."
      });
    } finally {
      setTimeout(() => setIsSubmitting(false), 800);
    }
  };

  if (isSubmitted) {
    return (
      <div className="py-20 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto border border-emerald-400/20 shadow-[0_0_50px_rgba(52,211,153,0.1)]">
          <CheckCircle size={40} />
        </div>
        <div>
          <h3 className="fd text-3xl font-medium mb-2 uppercase tracking-wide">Message Sent!</h3>
          <p className="text-[var(--t2)] font-light max-w-sm mx-auto text-sm">
            Your message has been received by our team. We'll get back to you within 12 hours.
          </p>
        </div>
        <button
          onClick={() => setIsSubmitted(false)}
          className="text-[#D4962A] text-[0.65rem] font-black uppercase tracking-[0.3em] hover:opacity-70 transition-opacity"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[0.6rem] uppercase tracking-[0.3em] text-[var(--t3)] font-black ml-1">Full Name</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            className="w-full bg-[var(--s1)] border border-[var(--bw2)] rounded-2xl py-4 px-6 text-sm text-[var(--t1)] focus:outline-none focus:border-[#D4962A]/50 transition-all font-light placeholder:text-[var(--t4)]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[0.6rem] uppercase tracking-[0.3em] text-[var(--t3)] font-black ml-1">Email Address</label>
          <input
            required
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
            className="w-full bg-[var(--s1)] border border-[var(--bw2)] rounded-2xl py-4 px-6 text-sm text-[var(--t1)] focus:outline-none focus:border-[#D4962A]/50 transition-all font-light placeholder:text-[var(--t4)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[0.6rem] uppercase tracking-[0.3em] text-[var(--t3)] font-black ml-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+971 50..."
            className="w-full bg-[var(--s1)] border border-[var(--bw2)] rounded-2xl py-4 px-6 text-sm text-[var(--t1)] focus:outline-none focus:border-[#D4962A]/50 transition-all font-light placeholder:text-[var(--t4)]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[0.6rem] uppercase tracking-[0.3em] text-[var(--t3)] font-black ml-1">Enquiry Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full bg-[var(--s1)] border border-[var(--bw2)] rounded-2xl py-4 px-6 text-sm text-[var(--t1)] focus:outline-none focus:border-[#D4962A]/50 transition-all appearance-none cursor-pointer font-light"
          >
            <option>General Inquiry</option>
            <option>Luxury Custom Tour</option>
            <option>Corporate Events</option>
            <option>Booking Modification</option>
            <option>Partnership</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[0.6rem] uppercase tracking-[0.3em] text-[var(--t3)] font-black ml-1">Your Detailed Message</label>
        <textarea
          required
          rows={5}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Tell us about your dream adventure..."
          className="w-full bg-[var(--s1)] border border-[var(--bw2)] rounded-2xl py-4 px-6 text-sm text-[var(--t1)] focus:outline-none focus:border-[#D4962A]/50 transition-all resize-none font-light placeholder:text-[var(--t4)]"
        />
      </div>

      <button
        disabled={isSubmitting}
        className="w-full py-5 rounded-2xl bg-[#D4962A] text-black font-black uppercase tracking-[0.3em] text-xs transition-all hover:scale-[1.01] active:scale-95 shadow-[0_15px_40px_rgba(212,150,42,0.3)] flex items-center justify-center gap-3"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            Send Message <Send size={14} />
          </>
        )}
      </button>
    </form>
  );
}
