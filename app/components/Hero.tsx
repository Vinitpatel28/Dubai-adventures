"use client";

import { useEffect, useState, useRef } from "react";
import { Star, Shield, Clock, Users, Video, MapPin, Eye, Sparkles } from "lucide-react";
import Image from "next/image";
import { useSettings } from "../context/SettingsContext";
import { useLanguage } from "../context/LanguageContext";

const TRUST = [
  { icon: Star, label: "Premium Experiences" },
  { icon: Shield, label: "Free Cancellation" },
  { icon: Clock, label: "Instant Booking" },
  { icon: Users, label: "Expert Guides" },
];

const DEFAULT_BGS = [
  "/images/hero_bg_4k_1772860004560.png",
  "/images/dune_bashing_4k_1772860044787.png",
  "/images/morning_safari_4k_1772860024785.png",
  "/images/red_dunes_atv_4k_1772860060049.png",
  "/images/deluxe_safari_4k_1772860076185.png",
  "/images/balloon_4k_1772860090220.png",
  "/images/superyacht_4k_1772860109758.png",
  "/images/buggy_4k_1772860128952.png"
];

export default function Hero() {
  const { settings } = useSettings();
  const { t, direction, language } = useLanguage();
  const [ready, setReady] = useState(false);
  const [currentBg, setCurrentBg] = useState(0);
  const [particles, setParticles] = useState<{left:string, top:string, delay:string, duration:string}[]>([]);
  const [videoError, setVideoError] = useState(false);

  const heroImages = settings?.heroImages?.length ? settings.heroImages : DEFAULT_BGS;
  const videoUrl = settings?.heroVideoUrl;
  const videoEnabled = settings?.heroVideoEnabled && !videoError;



  useEffect(() => {
    setParticles(Array.from({ length: 15 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${10 + Math.random() * 20}s`
    })));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (heroImages.length === 0 || videoEnabled) return;
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length, videoEnabled]);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoUrl && settings?.heroVideoEnabled) {
      // We rely on autoPlay + key={videoUrl} to load the video.
      // Calling play() explicitly catches any browser policy blocks.
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          if (e.name === 'AbortError') return; // Safe to ignore, browser is optimizing the load
          console.warn("Autoplay prevention intercepted. Browser paused video (likely Low Power Mode or Data Saver):", e.message || e);
        });
      }
    }
  }, [videoUrl, settings?.heroVideoEnabled]);

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden theme-force-dark">

      {/* Background layer */}
      <div className="absolute inset-0 bg-[#070604] overflow-hidden">
        
        {/* Video Layer (2026 Premium Standard) */}
        {settings?.heroVideoEnabled && videoUrl && !videoError && (
          <div className="absolute inset-0 z-0">
            {(() => {
              try {
                const isVimeo = videoUrl.includes('vimeo.com');
                const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
                
                if (isVimeo) {
                  const id = videoUrl.split('/').pop()?.split('?')[0];
                  return (
                    <iframe
                      src={`https://player.vimeo.com/video/${id}?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1`}
                      className="w-full h-full object-cover scale-[1.05]"
                      style={{ border: 'none', pointerEvents: 'none' }}
                      allow="autoplay; fullscreen"
                    />
                  );
                }
                
                if (isYouTube) {
                  const id = videoUrl.includes('youtu.be') 
                    ? videoUrl.split('/').pop()?.split('?')[0] 
                    : new URLSearchParams(new URL(videoUrl).search).get('v');
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&modestbranding=1&rel=0`}
                      className="w-full h-full object-cover scale-[1.05]"
                      style={{ border: 'none', pointerEvents: 'none' }}
                      allow="autoplay; fullscreen"
                    />
                  );
                }
              } catch (e) {
                console.warn("Video URL Parser fallback executed. Not a standard Vimeo/YouTube link.");
              }

              return (
                <video
                  key={videoUrl}
                  ref={videoRef}
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  onError={(e) => { 
                    const target = e.target as HTMLVideoElement;
                    if (target.error?.code !== 4) {
                      console.warn(`Video playback hindered (Code: ${target.error?.code}). Auto-falling back to image slider.`); 
                    }
                    setVideoError(true); 
                  }}
                  className="w-full h-full object-cover scale-105"
                  style={{ filter: "brightness(0.95) contrast(1.05)" }}
                />
              );
            })()}
          </div>
        )}

        {/* Image Slider Layer (Static/Fallback) — Only render current + next */}
        {!videoEnabled && heroImages.length > 0 && (() => {
          const nextBg = (currentBg + 1) % heroImages.length;
          const visibleIndices = [currentBg, nextBg];
          return visibleIndices.map((i) => (
            <div
              key={`hero-${i}-${heroImages[i]}`}
              className="absolute inset-0 transition-opacity duration-[2500ms] ease-in-out"
              style={{ opacity: i === currentBg ? 1 : 0 }}
            >
              <Image
                src={heroImages[i]}
                alt="Dubai Adventure Background"
                fill
                priority={i === currentBg}
                className="object-cover scale-105"
                style={{ filter: "brightness(1) contrast(1.02)" }}
                sizes="100vw"
              />
            </div>
          ));
        })()}

        {/* Floating cinematic particles layer */}
        <div className="absolute inset-0 pointer-events-none opacity-40 z-[1]">
           {particles.map((p, i) => (
             <div 
               key={i}
               className="absolute w-1 h-1 bg-amber-200/40 rounded-full blur-[1px] animate-float-dust"
               style={{
                 left: p.left,
                 top: p.top,
                 animationDelay: p.delay,
                 animationDuration: p.duration
               }}
             />
           ))}
        </div>

        {/* Multi-layer gradient overlay for depth - Lightened for clarity */}
        <div className="absolute inset-0 z-[2]" style={{ background: "linear-gradient(180deg, rgba(7,6,4,0.1) 0%, transparent 40%, rgba(7,6,4,0.1) 75%, rgba(7,6,4,0.6) 100%)" }} />
        <div className="absolute inset-0 z-[2]" style={{ background: "radial-gradient(circle at center, transparent 0%, rgba(7,6,4,0.2) 100%)" }} />
      </div>

      {/* Content */}
      <div className={`relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-8 text-center transition-transform duration-1000 ${ready ? "translate-y-[-4vh]" : ""}`}>



        {/* Eyebrow badge */}
        <div
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-full mb-5 transition-all duration-700 delay-100 ${ready ? "a-up opacity-100" : "opacity-0"}`}
          style={{
            background: "rgba(212,150,42,0.1)",
            border: "1px solid rgba(212,150,42,0.3)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Sparkles size={12} className="text-[var(--g200)]" />
          <span className="text-[0.63rem] tracking-[0.3em] uppercase font-semibold" style={{ color: "var(--g200)" }}>
            {t('hero.badge')}
          </span>
        </div>

        {/* Main headline */}
        <h1
          className={`fd leading-[1.02] tracking-[-0.01em] mb-4 transition-all duration-1000 delay-200 ${ready ? "a-up opacity-100" : "opacity-0"}`}
          style={{ fontSize: "clamp(3.2rem, 9vw, 8rem)", fontWeight: 300 }}
        >
          <span className="block text-white italic">{t('hero.title.1')}</span>
          <em className="block gold-text not-italic" style={{ fontStyle: "normal", fontWeight: 400 }}>
            {t('hero.title.2')}
          </em>
        </h1>

        {/* Subtitle */}
        <p
          className={`text-[1.1rem] font-light leading-[1.75] max-w-lg mx-auto mb-6 transition-all duration-700 delay-300 ${ready ? "a-up opacity-100" : "opacity-0"}`}
          style={{ color: "var(--t2)" }}
        >
          {t('hero.subtitle')}
        </p>

        {/* CTAs */}
        <div
          className={`flex items-center justify-center gap-4 flex-wrap mb-6 transition-all duration-700 delay-400 ${ready ? "a-up opacity-100" : "opacity-0"}`}
        >
          <a href="#activities">
            <button className="btn-g px-10 py-4 shadow-[0_15px_30px_-10px_rgba(212,150,42,0.4)]">
              {t('hero.cta.explore')}
            </button>
          </a>
          <a href="#about">
            <button className="btn-o px-10 py-4 hover:bg-white/5">
              {t('hero.cta.story')}
            </button>
          </a>
        </div>

        {/* Trust badges row */}
        <div
          className={`flex items-center justify-center gap-x-12 gap-y-6 flex-wrap transition-all duration-700 delay-500 ${ready ? "a-up opacity-100" : "opacity-0"}`}
        >
          {TRUST.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 text-[0.68rem] tracking-[0.15em] font-medium uppercase"
              style={{ color: "var(--t4)" }}
            >
              <Icon size={13} style={{ color: "var(--g300)" }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[0.55rem] tracking-[0.4em] uppercase font-black" style={{ color: "var(--t4)" }}>Scroll</span>
        <div className="w-px h-10 overflow-hidden" style={{ background: "var(--bw1)" }}>
          <div className="w-full h-full scroll-ind" style={{ background: "linear-gradient(180deg, var(--g300), transparent)" }} />
        </div>
      </div>
    </section>
  );
}

