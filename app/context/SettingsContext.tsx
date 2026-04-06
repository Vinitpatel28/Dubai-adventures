'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SocialLinks {
  instagram: string;
  facebook: string;
  whatsapp: string;
  twitter: string;
  youtube: string;
}

interface Settings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: SocialLinks;
  currency: string;
  maintenanceMode: boolean;
  heroImages?: string[];
  heroVideoUrl?: string;
  heroVideoEnabled?: boolean;
  legalUrls?: {
    privacy: string;
    terms: string;
    cookies: string;
  };
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  refreshSettings: (force?: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async (force = false) => {
    try {
      if (!force && typeof window !== 'undefined') {
        const cached = sessionStorage.getItem('settings_data_v1');
        if (cached) {
          const { settings: cSettings, timestamp } = JSON.parse(cached);
          // Reduced cache from 15 minutes to 5 seconds to guarantee live updates
          if (Date.now() - timestamp < 5 * 1000) { 
            setSettings(cSettings);
            setLoading(false);
            return;
          }
        }
      }

      const res = await fetch('/api/settings', { next: { revalidate: 0 }, cache: 'no-store' });
      if (!res.ok) {
        console.error(`Settings API error: ${res.status} ${res.statusText}`);
        return;
      }
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('settings_data_v1', JSON.stringify({ settings: data.settings, timestamp: Date.now() }));
        }
      }
    } catch (err) {
      console.error('Settings Fetch Critical Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
