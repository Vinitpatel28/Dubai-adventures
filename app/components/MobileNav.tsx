"use client";

import { Home, Compass, Calendar, ShoppingBag, User, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { count: cartCount } = useCart();

  const { t } = useLanguage();
  const NAV_ITEMS = [
    { label: t('nav.home'),    icon: Home,        href: "/" },
    { label: t('nav.search'),  icon: Search,      href: "/#experiences", action: "scrollSearch" },
    { label: "Cart",           icon: ShoppingCart, href: "/cart", badge: cartCount },
    { label: t('nav.bookings'),icon: Calendar,    href: "/bookings" },
    { label: t('nav.profile'), icon: User,        href: user ? "/bookings" : "#", action: !user ? "openAuthModal" : undefined },
  ];

  return (
    <div className="md:hidden fixed bottom-6 inset-x-5 z-[100] animate-in slide-in-from-bottom-10 duration-700">
      <div className="glass-nav rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2">
        <ul className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon     = item.icon;

            return (
              <li key={item.label} className="flex-1">
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (item.action === "openAuthModal") {
                      e.preventDefault();
                      window.dispatchEvent(new CustomEvent("openAuthModal"));
                    }
                    if (item.action === "scrollSearch") {
                      e.preventDefault();
                      document.getElementById("experiences")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                  }}
                  className={`flex flex-col items-center gap-1 py-2 px-1 rounded-2xl transition-all duration-300 ${
                    isActive ? "gold-text" : "text-[var(--t3)] "
                  }`}
                >
                  <div className={`relative p-2 rounded-xl transition-all duration-500 ${isActive ? "bg-[var(--g300)]/10 scale-110" : "bg-transparent"}`}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--g300)] text-[#050403] text-[0.5rem] font-black flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[0.55rem] font-black uppercase tracking-[0.15em] transition-opacity ${isActive ? "opacity-100" : "opacity-40"}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
