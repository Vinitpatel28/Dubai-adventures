"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type LanguageCode = 'en' | 'ar' | 'fr' | 'ru' | 'de' | 'zh' | 'hi' | 'ja' | 'ko' | 'es' | 'pt' | 'it' | 'tr';

interface Language {
  code: LanguageCode;
  label: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ar', label: 'العربية', flag: '🇦🇪', dir: 'rtl' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'zh', label: '简体中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'ko', label: '한국어', flag: '🇰🇷', dir: 'ltr' },
  { code: 'es', label: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'pt', label: 'Português', flag: '🇵🇹', dir: 'ltr' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
];

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  t: (key: string, fallback?: string) => string;
  direction: 'ltr' | 'rtl';
  isSynthesizing: boolean;
  translateDynamic: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ═══════════════════════════════════════════════
//  ENGLISH-ONLY UI LABELS
//  Google Translate handles ALL translations.
//  These are just English defaults so the DOM
//  always has clean, translatable text.
// ═══════════════════════════════════════════════
const labels: Record<string, string> = {
  // Navbar
  'nav.about': 'About',
  'nav.bookings': 'Bookings',
  'nav.packages': 'Packages',
  'nav.contact': 'Contact',
  'nav.categories': 'Categories',
  'nav.logout': 'Logout',
  'nav.join': 'Join',
  'nav.home': 'Home',
  'nav.search': 'Search',
  'nav.explore': 'Explore',
  'nav.profile': 'Profile',

  // Hero
  'hero.badge': 'Premium Desert Experiences · Dubai, UAE',
  'hero.title.1': 'Dubai Outdoor',
  'hero.title.2': 'Adventures',
  'hero.subtitle': 'Curating the finest desert safaris and bespoke outdoor journeys in Dubai since 2014.',
  'hero.cta.explore': 'Explore Packages',
  'hero.cta.story': 'Read Our Story',

  // Activity Grid
  'grid.curated': 'Curated Experiences',
  'grid.signature': 'Signature',
  'grid.adventures': 'Adventures',
  'grid.subtitle': 'Handpicked experiences that deliver unparalleled thrills and luxury memories beneath Dubai\'s golden skies.',
  'grid.empty.title': 'Awaiting Discovery',
  'grid.empty.back': 'View All Experiences',
  'grid.all': 'All Experiences',
  'grid.combo': 'Super Savers',
  'grid.total': 'Total',
  'grid.multi_activity_bundle': 'Multi-Activity Bundle',
  'grid.off': 'OFF',

  // Category Labels
  'cat.combo': 'Super Savers',
  'cat.desert': 'Desert Safari',
  'cat.atv': 'ATV & Buggy',
  'cat.luxury': 'Premium Luxury',
  'cat.sky': 'Sky & Balloon',
  'cat.cruises': 'Dhow Cruises',
  'cat.theme-parks': 'Theme Parks',
  'cat.water': 'Yacht & Water',
  'cat.fishing': 'Deep Sea Fishing',
  'cat.helicopter': 'Helicopter',
  'cat.scuba': 'Scuba Diving',

  // Shared UI
  'ui.view_details': 'View Details',
  'ui.from': 'From',
  'ui.person': '/ person',
  'ui.save': 'Save',
  'ui.best_value': 'Best Value Combo',
  'ui.back_to_experiences': 'Back to Experiences',
  'ui.premium_multi_experience': 'Premium Multi-Experience Journey',
  'ui.free_cancellation': 'Free Cancellation',
  'ui.mobile_voucher': 'Mobile Voucher',
  'ui.instant_access': 'Instant Access',
  'ui.expert_itinerary': 'Expert Itinerary',
  'ui.experience_timeline': 'Experience Timeline',
  'ui.book_now': 'Book Now',
  'ui.premium_rate': 'Premium Rate',
  'ui.reserve_package': 'Reserve this package',
  'ui.secure_checkout': 'Secure checkout guaranteed',
  'ui.inclusions': 'Inclusions',
  'ui.good_to_know': 'Good to Know',
  'ui.policies_safety': 'Policies & Safety',
  'ui.duration': 'Duration',
  'ui.group': 'Group',
  'ui.max_guests': 'Group Size',
  'ui.score': 'Score',
  'ui.location': 'Location',
  'ui.what_experience': 'What you\'ll experience',
  'ui.age_policy': 'Age Policy',
  'ui.languages': 'Languages',
  'ui.what_to_bring': 'What to Bring',
  'ui.cancellation': 'Cancellation',
  'ui.safety_warnings': 'Safety Warnings',
  'ui.luxury_guaranteed': 'Luxury Guaranteed',
  'ui.login_to_reserve': 'Login to Reserve',
  'ui.flexible': 'Flexible Cancellation',
  'ui.experience_highlights': 'Experience Highlights',

  // Booking steps
  'booking.secure_portal': 'Secure Checkout Portal',
  'booking.schedule': 'Schedule',
  'booking.guests': 'Guests',
  'booking.info': 'Guest Info',
  'booking.review': 'Review',
  'booking.payment': 'Payment',
  'booking.back': 'Back',
  'booking.cancel': 'Cancel',
  'booking.continue': 'Continue',
  'booking.pay_confirm': 'Pay & Confirm Booking',
  'booking.securing': 'Securing Funds...',
  'booking.proceed_payment': 'Proceed to Payment',
  'booking.your_booking': 'Your Booking',
  'booking.summary': 'Summary',
  'booking.adult': 'Adult',
  'booking.adults': 'Adults',
  'booking.child': 'Child',
  'booking.children': 'Children',
  'booking.seasonal_surcharge': 'Includes seasonal surcharge',
  'booking.edit_requirements': 'Edit Requirements',
  'booking.secure_encrypted': 'Secure & encrypted booking',
  'booking.free_cancellation_48': 'Free cancellation (48h notice)',
  'booking.no_hidden_fees': 'No hidden fees',

  // Footer
  'footer.experiences': 'Experiences',
  'footer.company': 'Company',
  'footer.contact': 'Contact',
  'footer.about_us': 'About Us',
  'footer.reviews': 'Reviews',
  'footer.terms': 'Terms of Service',
  'footer.privacy': 'Privacy Policy',
  'footer.all_rights': 'All rights reserved.',

  // Booking Step 1
  'booking.step_01': 'Step 01',
  'booking.create_schedule': 'Create Your Schedule',
  'booking.currently_scheduling': 'Currently Scheduling',
  'booking.choose_date': 'Choose Travel Date',
  'booking.peak_pricing': 'Peak Pricing',
  'booking.seasonal_markup': 'A seasonal markup is applied to this peak travel date.',
  'booking.available_slots': 'Available Time slots',
  'booking.expired': 'Expired',
  'booking.overlap_blocked': 'Overlap Blocked',
  'booking.select_date_instruction': 'Please select a preferred date from the calendar to view available slots',

  // Booking Step 2
  'booking.step_02': 'Step 02',
  'booking.add_participants': 'Add Participants',
  'booking.select_group_size': 'Select Group Size',
  'booking.adults_label': 'Adults',
  'booking.adults_sub': 'Age 12+',
  'booking.children_label': 'Children',
  'booking.children_sub': 'Age 3 - 11',
  'booking.child_policy': 'Child Policy',
  'booking.infant_policy_text': 'Infants under 3 years are complimentary on most desert safaris. Please mention in the notes if you are travelling with infants.',

  // Booking Step 3
  'booking.step_03': 'Step 03',
  'booking.primary_traveller': 'Primary Traveller Details',
  'booking.full_name': 'Full Name',
  'booking.email_address': 'Email Address',
  'booking.phone_number': 'Phone Number',
  'booking.pickup_address': 'Pickup Address / Hotel',
  'booking.placeholder_id': 'As on identification',
  'booking.placeholder_conf': 'For booking confirmation',
  'booking.placeholder_loc': 'Exact location in Dubai',

  // Booking Step 4
  'booking.step_04': 'Step 04',
  'booking.verify_dossier': 'Verify Booking Dossier',
  'booking.adventure_identity': 'Adventure Identity',
  'booking.final_consideration': 'Final Consideration',
  'booking.base_experience': 'Base Experience',
  'booking.premium_transport': 'Premium Transport',
  'booking.total_due': 'Total Due',
  'booking.inclusive_vat': 'Inclusive of VAT',
  'booking.voucher': 'Voucher',

  // Booking Step 5
  'booking.step_05': 'Step 05',
  'booking.final_secure_ledger': 'Final Secure Ledger',
  'booking.credit_debit': 'Credit / Debit',
  'booking.digital_wallet': 'Digital Wallet',
  'booking.cardholder_name': 'Cardholder Name',
  'booking.card_number': 'Card Number',
  'booking.expires': 'Expires',
  'booking.cvv': 'CVV',
  'booking.express_checkout': 'Express Digital Checkout',
  'booking.biometric_verification': 'Biometric Verification Enabled',
  'booking.secure_payment_total': 'Secure Payment Total',
  'booking.secure_payment_info': 'Your transaction is encrypted with 256-bit SSL. Dubai Adventures LLC does not store your full card details.',

  // Grid & Promos
  'grid.exclusive_offer': 'Exclusive Offer',
  'grid.valid_sitewide': 'Valid Site-wide',
  'grid.limited_time': 'Limited Time Only',
  'grid.no_match_title': "Can't find your perfect match?",
  'grid.no_match_subtitle': 'Mix and match any experiences to create your own custom Super Saver package and save up to 20%.',
  'grid.build_combo': 'Build Your Own Combo',

  // Search
  'search.placeholder': 'What are you looking for?',
  'search.analyzing': 'Analyzing Hub',
  'search.match_score': 'Match Score',
  'search.investment': 'Investment',
  'search.no_exact_match_title': 'An unparalleled request requires a bespoke answer.',
  'search.no_exact_match_sub': 'I couldn\'t find an exact match for your request, but our elite AI can curate a journey just for you.',
  'search.initiate_ai': 'Initiate AI Synthesis',

  // Reviews
  'reviews.title': 'Guest Reviews',
  'reviews.write_review': 'Write a Review',
  'reviews.no_reviews': 'No reviews yet',
  'reviews.be_first': 'Be the first to share your experience!',
  'reviews.verified': 'Verified',
  'reviews.helpful': 'Helpful',
  'reviews.submitting': 'Submitting...',
  'reviews.submit_review': 'Submit Review',
  'reviews.success': 'Your review has been submitted! Thank you.',
  'reviews.share_experience': 'Share Your Experience',
  'reviews.your_rating': 'Your rating',
  'reviews.your_name': 'Your Name',
  'reviews.review_title': 'Review Title',
  'reviews.your_review': 'Your Review',
  'reviews.rating_breakdown': 'Rating Breakdown',

  // Newsletter
  'newsletter.badge': 'The Elite Circle',
  'newsletter.title': 'Stay in the Know',
  'newsletter.subtitle': 'Join 12,000+ luxury travelers. Get private early-access to new adventures, seasonal deals, and Dubai secret guides.',
  'newsletter.placeholder': 'Enter your email address',
  'newsletter.button': 'Subscribe',
  'newsletter.success': "You're in! Check your email.",
  'newsletter.privacy': 'No Spam. Only Gold. Unsubscribe anytime.',
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    // On mount, check if a language was previously saved
    const saved = localStorage.getItem('language') as LanguageCode;
    if (saved && LANGUAGES.some(l => l.code === saved)) {
      setLanguageState(saved);
      const langObj = LANGUAGES.find(l => l.code === saved);
      if (langObj) {
        document.documentElement.dir = langObj.dir;
      }
    }
  }, []);

  const setLanguage = useCallback((code: LanguageCode) => {
    setLanguageState(code);
    localStorage.setItem('language', code);

    // Set text direction (RTL for Arabic)
    const langObj = LANGUAGES.find(l => l.code === code);
    if (langObj) {
      document.documentElement.dir = langObj.dir;
    }

    // Map internal code to Google Translate code
    const googleCode = code === 'zh' ? 'zh-CN' : code;

    // Set the googtrans cookie in ALL possible ways for reliability
    if (code !== 'en') {
      const val = `/en/${googleCode}`;
      document.cookie = `googtrans=${val}; path=/;`;
      document.cookie = `googtrans=${val}; path=/; domain=${window.location.hostname};`;
      document.cookie = `googtrans=${val}; path=/; domain=.${window.location.hostname};`;
    } else {
      // Clear all googtrans cookies to revert to English
      document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `googtrans=; path=/; domain=.${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    }
  }, []);

  // Simple label lookup — always returns English.
  // Google Translate will translate the rendered English text in the DOM.
  const t = useCallback((key: string, fallback?: string) => {
    return labels[key] || fallback || key;
  }, []);

  // Kept for backward compatibility — just returns the original text.
  // Google Translate handles the actual translation in the DOM.
  const translateDynamic = useCallback(async (text: string): Promise<string> => {
    return text;
  }, []);

  const direction = LANGUAGES.find(l => l.code === language)?.dir || 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, direction, isSynthesizing: false, translateDynamic }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
