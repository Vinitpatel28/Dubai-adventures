"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle, Calendar, Users, Hash, Clock, Download, Share2, ArrowRight } from "lucide-react";
import { BookingConfirmation } from "../types";
import { format } from "date-fns";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { useCurrency } from "../context/CurrencyContext";

interface Props {
  confirmation: BookingConfirmation;
  onNewBooking: () => void;
}

const CONFETTI_COLORS = ["#ECC86A","#D4962A","#F5E0A0","#B87620","#fff","#ECC86A"];

export default function BookingSuccess({ confirmation, onNewBooking }: Props) {
  const { convert, symbol } = useCurrency();
  const [ready, setReady] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; color: string; delay: number; dur: number }[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    setConfetti(
      Array.from({ length: 28 }, (_, i) => ({
        x: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 1.5,
        dur: 2.5 + Math.random() * 1.5,
      }))
    );
    return () => clearTimeout(t);
  }, []);

  const handleSavePDF = () => {
    const doc = new jsPDF();
    const b = confirmation;
    const dateStr = format(b.date, "EEEE, MMMM do, yyyy");
    
    // Luxury Layout (jsPDF coordinates are in mm)
    // Primary Header
    doc.setFillColor(7, 6, 4); // #070604
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(212, 150, 42); // #D4962A
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("DUBAI ADVENTURES", 105, 22, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("PREMIUM DESERT SAFARIS & BESPOKE JOURNEYS", 105, 30, { align: "center" });
    
    // Voucher Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL BOOKING VOUCHER", 20, 60);
    
    // Horizontal Line
    doc.setDrawColor(212, 150, 42);
    doc.setLineWidth(0.5);
    doc.line(20, 65, 190, 65);
    
    // Reference Info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`REFERENCE ID:`, 20, 75);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(b.bookingId, 55, 75);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`ISSUED ON:`, 140, 75);
    doc.setTextColor(0, 0, 0);
    doc.text(new Date().toLocaleDateString(), 170, 75);

    // Guest Details Section
    doc.setFillColor(248, 248, 248);
    doc.rect(20, 85, 170, 35, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("TRAVELER INFORMATION", 25, 95);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(b.fullName, 25, 102);
    doc.setFontSize(9);
    doc.text(`E: ${b.email} | P: ${b.phone}`, 25, 110);

    // Adventure Details
    let y = 135;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ADVENTURE ITINERARY", 20, y);
    doc.line(20, y+3, 190, y+3);
    
    y += 15;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("EXPERIENCE TYPE:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(b.activity.title, 65, y);
    
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("DATE & TIME:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${dateStr} @ ${b.timeSlot}`, 65, y);
    
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text("PARTY SIZE:", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${b.adults} Adults, ${b.children} Children`, 65, y);

    // Financials
    y += 30;
    doc.setFillColor(7, 6, 4);
    doc.rect(130, y-10, 60, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("TOTAL PAID", 140, y-2);
    doc.setFontSize(14);
    doc.setTextColor(212, 150, 42);
    doc.text(`${convert(b.totalPrice)}`, 140, y+5);

    // Footer terms
    y = 260;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("IMPORTANT INSTRUCTIONS:", 20, y);
    doc.setFontSize(7);
    doc.text("• Please arrive 15 minutes before your scheduled departure time.", 20, y+6);
    doc.text("• Present this voucher at the boarding point. Digital copies are accepted.", 20, y+10);
    doc.text("• Cancellation policy: Full refund up to 24 hours before the event.", 20, y+14);
    
    doc.setFontSize(8);
    doc.text("Dubai Adventures LLC - Premium Desert Services | Emirates Dubai", 105, 285, { align: "center" });

    doc.save(`Voucher_${b.bookingId}.pdf`);
    toast.success("Professional voucher saved to downloads.");
  };

  const handleShare = async () => {
    const shareText = `Confirmed! I'm booked for ${confirmation.activity.title} in Dubai. Ref: ${confirmation.bookingId}`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Dubai Adventures Booking Confirmed",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText} - ${shareUrl}`);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Hello Dubai Adventures! 🇦E\n\nI just confirmed my booking for *${confirmation.activity.title}*.\n\n🎟️ *Booking ID:* ${confirmation.bookingId}\n📅 *Date:* ${format(confirmation.date, "MMM d, yyyy")}\n👥 *Guests:* ${confirmation.adults} Adults, ${confirmation.children} Children\n\nPlease confirm our pick-up time. Thank you!`);
    window.open(`https://wa.me/971501234567?text=${text}`, "_blank");
  };

  return (
    <div
      className="relative min-h-[80vh] flex items-center justify-center px-5 py-20 overflow-hidden"
      style={{ background: "linear-gradient(180deg, var(--s0) 0%, var(--s1) 50%, var(--s0) 100%)" }}
    >
      {/* Confetti */}
      {ready && confetti.map((c, i) => (
        <div
          key={i}
          className="absolute top-0 w-2 h-2 rounded-sm pointer-events-none"
          style={{
            left: `${c.x}%`,
            background: c.color,
            animation: `confettiDrop ${c.dur}s ${c.delay}s ease-in both`,
            opacity: 0,
          }}
        />
      ))}

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(212,150,42,0.07) 0%, transparent 60%)" }} />

      <div className="relative z-10 max-w-lg w-full text-center">

        {/* ─── Animated checkmark ── */}
        <div className={`relative w-32 h-32 mx-auto mb-8 ${ready ? "a-scale" : "opacity-0"}`}>
          {/* Outer pulse ring */}
          <div
            className="absolute inset-0 rounded-full ring-pulse"
            style={{ background: "rgba(212,150,42,0.08)", border: "2px solid rgba(212,150,42,0.25)" }}
          />
          {/* Middle ring */}
          <div
            className="absolute inset-4 rounded-full"
            style={{ background: "linear-gradient(135deg, rgba(212,150,42,0.18), rgba(212,150,42,0.06))", border: "1px solid rgba(212,150,42,0.3)" }}
          />
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle
              size={52}
              style={{
                color: "var(--g200)",
                filter: "drop-shadow(0 0 16px rgba(212,150,42,0.5))",
              }}
              className={ready ? "check-in" : "opacity-0"}
            />
          </div>
        </div>

        {/* ─── Text ── */}
        <p className={`text-[0.65rem] tracking-[0.35em] uppercase font-semibold mb-3 ${ready ? "a-up d1" : "opacity-0"}`} style={{ color: "var(--g300)" }}>
          ✦ Booking Confirmed
        </p>

        <h2
          className={`fd leading-[1.08] mb-5 ${ready ? "a-up d2" : "opacity-0"}`}
          style={{ fontSize: "clamp(1.9rem, 4vw, 3.1rem)", fontWeight: 300 }}
        >
          Your Dubai adventure<br />
          <em className="gold-text not-italic" style={{ fontStyle: "normal" }}>is confirmed!</em>
        </h2>

        <p
          className={`text-[0.86rem] leading-[1.7] mb-10 max-w-sm mx-auto ${ready ? "a-up d3" : "opacity-0"}`}
          style={{ color: "var(--t2)" }}
        >
          Thank you,{" "}
          <strong className="text-white">{confirmation.fullName}</strong>! A confirmation has been sent to{" "}
          <strong style={{ color: "var(--g200)" }}>{confirmation.email}</strong>.
          Our team will be in touch within 24 hours.
        </p>

        {/* ─── Booking card ── */}
        <div
          className={`rounded-2xl overflow-hidden mb-8 text-left ${ready ? "a-up2 d3" : "opacity-0"}`}
          style={{ background: "var(--s2)", border: "1px solid var(--bg1)", boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}
        >
          {/* Image strip */}
          <div className="relative h-44 overflow-hidden">
            <Image src={confirmation.activity.image} alt={confirmation.activity.title} fill className="object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(7,6,4,0.1) 0%, rgba(7,6,4,0.9) 100%)" }} />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="fd text-[1rem] font-medium text-white leading-snug">{confirmation.activity.title}</p>
              <p className="text-[0.7rem] mt-0.5" style={{ color: "var(--g300)" }}>{confirmation.activity.subtitle}</p>
            </div>
          </div>

          {/* Details grid */}
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { icon: <Hash size={12}/>,      label: "Booking ID", val: confirmation.bookingId },
                { icon: <Calendar size={12}/>,  label: "Date",       val: format(confirmation.date, "MMM d, yyyy") },
                { icon: <Clock size={12}/>,     label: "Time",       val: confirmation.timeSlot },
                { icon: <Users size={12}/>,     label: "Guests",     val: `${confirmation.adults}A${confirmation.children ? ` · ${confirmation.children}C` : ""}` },
              ].map((d) => (
                <div
                  key={d.label}
                  className="p-3 rounded-xl"
                  style={{ background: "var(--bw4)", border: "1px solid var(--bw1)" }}
                >
                  <p className="flex items-center gap-1.5 text-[0.6rem] uppercase tracking-wider mb-1.5" style={{ color: "var(--t3)" }}>
                    <span style={{ color: "var(--g300)" }}>{d.icon}</span>
                    {d.label}
                  </p>
                  <p className="text-[0.84rem] font-semibold text-white">{d.val}</p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div
              className="flex items-center justify-between px-4 py-3.5 rounded-xl"
              style={{ background: "rgba(212,150,42,0.09)", border: "1px solid rgba(212,150,42,0.22)" }}
            >
              <span className="text-[0.68rem] uppercase tracking-wider" style={{ color: "var(--t3)" }}>Total Paid</span>
              <span className="fd text-[1.85rem] font-medium gold-text leading-none">
                {convert(confirmation.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Actions ── */}
        <div className={`flex items-center justify-center gap-3 flex-wrap md-no-print ${ready ? "a-up d4" : "opacity-0"}`}>
          <button className="btn-g px-8 py-3.5" onClick={onNewBooking}>
            Book Another
            <ArrowRight size={14} />
          </button>
          <button className="btn-o px-5 py-3.5 flex items-center gap-2 bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366]" onClick={handleWhatsApp}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Confirm on WhatsApp
          </button>
          <button className="btn-o px-5 py-3.5" onClick={handleSavePDF}>
            <Download size={14} /> Save PDF
          </button>
          <button className="btn-o px-5 py-3.5" onClick={handleShare}>
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes confettiDrop {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(120vh) rotate(680deg); opacity: 0; }
        }

        @media print {
          .md-no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .relative { min-height: auto !important; padding-top: 20px !important; }
          [style*="background: var(--s2)"] { background: #f9f9f9 !important; border: 1px solid #ddd !important; box-shadow: none !important; }
          .gold-text { color: #D4962A !important; -webkit-print-color-adjust: exact; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
