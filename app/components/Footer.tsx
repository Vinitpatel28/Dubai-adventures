'use client';

import { MapPin, Phone, Mail, Instagram, Facebook, Youtube, MessageSquare } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";

const EXPERIENCES = ["Desert Safari", "ATV & Quad Biking", "Hot Air Balloon", "Luxury Yacht", "Sandboarding", "Buggy Tours"];
const COMPANY = ["About Us", "Reviews", "Blog", "Careers", "Press"];

export default function Footer({ categories = [], onSelectActivity }: { categories?: any[], onSelectActivity?: (name: string) => void }) {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const router = useRouter();

  const handleExperienceClick = (item: any) => {
    const query = item.slug || item.name;
    if (onSelectActivity) {
      onSelectActivity(query);
    } else {
      router.push(`/?category=${encodeURIComponent(query)}#experiences`);
    }
  };

  const ensureProtocol = (url: string) => {
    if (!url || url === "#") return "#";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://${url}`;
  };

  const socialLinks = [
    { icon: <Instagram size={15} />, label: "Instagram", href: ensureProtocol(settings?.socialLinks.instagram || "") },
    { icon: <Facebook size={15} />, label: "Facebook", href: ensureProtocol(settings?.socialLinks.facebook || "") },
    { icon: <Youtube size={15} />, label: "YouTube", href: ensureProtocol(settings?.socialLinks.youtube || "") },
    { icon: <MessageSquare size={15} />, label: "WhatsApp", href: settings?.socialLinks.whatsapp ? `https://wa.me/${settings.socialLinks.whatsapp.replace(/\D/g, '')}` : "#" },
  ];

  return (
    <footer id="footer" style={{ background: "var(--s0)", borderTop: "1px solid var(--bw1)" }}>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-20">

        {/* ─── Grid ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-14">

          {/* Brand col */}
          <div className="lg:col-span-5">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-5">
              <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" stroke="url(#fl1)" strokeWidth="1.4" fill="none" />
                <circle cx="16" cy="16" r="3" fill="url(#fl1)" />
                <defs>
                  <linearGradient id="fl1" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6E420C" /><stop offset="0.5" stopColor="#ECC86A" /><stop offset="1" stopColor="#6E420C" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="fd text-[1.1rem] font-light">
                Dubai <em className="gold-text not-italic">Adventures</em>
              </span>
            </div>

            <p className="text-[0.84rem] leading-[1.75] mb-7 max-w-xs" style={{ color: "var(--t3)" }}>
              {settings?.siteDescription || "Dubai's premier outdoor adventure company. Crafting luxury desert safaris and exclusive experiences for discerning travelers since 2014."}
            </p>

            {/* Socials */}
            <div className="flex gap-2.5">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{ background: "var(--bw1)", border: "1px solid var(--bw1)", color: "var(--t3)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(212,150,42,0.14)";
                    (e.currentTarget as HTMLElement).style.color = "var(--g200)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--bg1)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "var(--bw1)";
                    (e.currentTarget as HTMLElement).style.color = "var(--t3)";
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--bw1)";
                    (e.currentTarget as HTMLElement).style.transform = "";
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Experiences */}
          <div className="lg:col-span-3" id="about">
            <p className="text-[0.65rem] tracking-[0.22em] uppercase font-semibold mb-5" style={{ color: "var(--g300)" }}>
              {t('footer.experiences')}
            </p>
            <ul className="space-y-3">
              {(categories.length > 0 ? categories : EXPERIENCES.map(e => ({ name: e }))).slice(0, 6).map((item: any) => (
                <li key={item.slug || item.name}>
                  <button
                    onClick={() => handleExperienceClick(item)}
                    className="text-[0.82rem] flex items-center gap-2 group transition-colors duration-200 text-left w-full"
                    style={{ color: "var(--t3)" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--t1)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--t3)"}
                  >
                    <span className="w-0 h-px transition-all duration-300 flex-shrink-0 group-hover:w-4" style={{ background: "var(--g300)" }} />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <p className="text-[0.65rem] tracking-[0.22em] uppercase font-semibold mb-5" style={{ color: "var(--g300)" }}>
              {t('footer.company')}
            </p>
            <ul className="space-y-3">
              {[
                { label: t('footer.about_us'), href: "/about" },
                { label: t('footer.reviews'), href: "/reviews" },
                { label: t('nav.contact'), href: "/contact" },
                { label: t('footer.terms'), href: "/terms" },
                { label: t('footer.privacy'), href: "/privacy" }
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[0.82rem] transition-colors duration-200"
                    style={{ color: "var(--t3)" }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--t1)"}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--t3)"}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2" id="contact">
            <p className="text-[0.65rem] tracking-[0.22em] uppercase font-semibold mb-5" style={{ color: "var(--g300)" }}>
              {t('footer.contact')}
            </p>
            <div className="space-y-4">
              {[
                {
                  icon: <MapPin size={13} />,
                  text: settings?.address || "Downtown Dubai, UAE",
                  href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings?.address || "Downtown Dubai, UAE")}`
                },
                {
                  icon: <Phone size={13} />,
                  text: settings?.contactPhone || "+971 50 123 4567",
                  href: `https://wa.me/${(settings?.contactPhone || "+971 50 123 4567").replace(/\D/g, '')}`
                },
                {
                  icon: <Mail size={13} />,
                  text: settings?.contactEmail || "bookings@dubaiadventures.com",
                  href: `mailto:${settings?.contactEmail || "bookings@dubaiadventures.com"}`
                },
              ].map((c) => (
                <a
                  key={c.text}
                  href={c.href}
                  target={c.href.startsWith('http') ? "_blank" : undefined}
                  rel={c.href.startsWith('http') ? "noopener noreferrer" : undefined}
                  className="flex items-start gap-3 text-[0.8rem] transition-colors duration-200 hover:text-[var(--t1)]"
                  style={{ color: "var(--t3)" }}
                >
                  <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--g400)" }}>{c.icon}</span>
                  {c.text}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Divider ── */}
        <div className="gold-line mb-7" />

        {/* ─── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[0.7rem]" style={{ color: "var(--t4)" }}>
            © {new Date().getFullYear()} {settings?.siteName || "Dubai Outdoor Adventures"}. {t('footer.all_rights')}
          </p>
          <div className="flex gap-5">
            {[
              { label: "Privacy Policy", link: settings?.legalUrls?.privacy || "#" },
              { label: "Terms of Service", link: settings?.legalUrls?.terms || "#" },
              { label: "Cookie Policy", link: settings?.legalUrls?.cookies || "#" }
            ].map((p) => (
              <a
                key={p.label}
                href={p.link}
                className="text-[0.69rem] transition-colors duration-200"
                style={{ color: "var(--t4)" }}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = "var(--t2)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = "var(--t4)"}
              >
                {p.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
