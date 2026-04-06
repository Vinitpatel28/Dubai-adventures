import type { Metadata } from "next";
import "./globals.css";
import { CurrencyProvider } from "./context/CurrencyContext";
import { SettingsProvider } from "./context/SettingsContext";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import Script from "next/script";
import { Cormorant_Garamond, Outfit } from "next/font/google";

import { Toaster } from "sonner";
import MobileNav from "./components/MobileNav";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--fd",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--fb",
  display: "swap",
});

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  title: "Dubai Outdoor Adventures | Premium Desert Experiences",
  description: "Book the best desert safari and outdoor experiences in Dubai. ATV rides, dune bashing, balloon rides, luxury yacht cruises and more.",
  keywords: ["Dubai", "desert safari", "ATV rides", "hot air balloon", "luxury yacht", "dune bashing", "outdoor adventures", "Dubai tourism"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dubaiadventures.com"),
  openGraph: {
    title: "Dubai Outdoor Adventures | Premium Desert Experiences",
    description: "Book the best desert safari and outdoor experiences in Dubai.",
    siteName: "Dubai Adventures",
    type: "website",
    locale: "en_AE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dubai Outdoor Adventures",
    description: "Book premium desert safaris and outdoor experiences in Dubai.",
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning className={`${cormorant.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#050403" />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var theme = localStorage.getItem('theme') || 'dark';
              document.documentElement.setAttribute('data-theme', theme);
              var lang = localStorage.getItem('language') || 'en';
              document.documentElement.lang = lang;
              document.documentElement.dir = 'ltr';
            } catch (e) {}
          })()
        `}} />
      </head>
      <body>
        <Toaster position="top-right" richColors closeButton />
        <AuthProvider>
          <LanguageProvider>
            <SettingsProvider>
              <CurrencyProvider>
                <CartProvider>
                  {children}
                  <MobileNav />
                  {/* Google Translate hidden anchor — accessible but invisible */}
                  <div id="google_translate_element" style={{ opacity: 0, height: 0, overflow: 'hidden', position: 'absolute' as any }} />
                </CartProvider>
              </CurrencyProvider>
            </SettingsProvider>
          </LanguageProvider>
        </AuthProvider>

        {/* Google Analytics */}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        {/* Google Translate Engine */}
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: `
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,ar,fr,ru,de,zh-CN,hi,ja,ko,es,pt,it,tr',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
                multilanguagePage: true
              }, 'google_translate_element');
            }
          `}}
        />
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
