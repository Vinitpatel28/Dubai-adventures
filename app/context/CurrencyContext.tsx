"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSettings } from "./SettingsContext";

export type CurrencyCode = "AED" | "USD" | "EUR" | "GBP" | "INR" | "SAR";

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string; rate: number }[] = [
  { code: "AED", symbol: "AED", label: "UAE Dirham", rate: 1 },
  { code: "USD", symbol: "$", label: "US Dollar", rate: 0.2723 },
  { code: "EUR", symbol: "€", label: "Euro", rate: 0.2505 },
  { code: "GBP", symbol: "£", label: "British Pound", rate: 0.2143 },
  { code: "INR", symbol: "₹", label: "Indian Rupee", rate: 22.78 },
  { code: "SAR", symbol: "SAR", label: "Saudi Riyal", rate: 1.0213 },
];

interface CurrencyCtx {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  convert: (aed: number) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyCtx>({
  currency: "AED",
  setCurrency: () => {},
  convert: (n) => `AED ${n.toLocaleString()}`,
  symbol: "AED",
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("AED");
  const { settings } = useSettings();

  useEffect(() => {
    // 1. Check local storage first
    const saved = localStorage.getItem("currency") as CurrencyCode;
    if (saved && CURRENCIES.find((c) => c.code === saved)) {
      setCurrencyState(saved);
      return;
    }

    // 2. Read from SettingsContext (no duplicate API call)
    if (settings?.currency && CURRENCIES.find((c) => c.code === settings.currency)) {
      setCurrencyState(settings.currency as CurrencyCode);
    }
  }, [settings]);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem("currency", c);
  };

  const curr = CURRENCIES.find((c) => c.code === currency)!;
  
  const convert = (aed: number) => {
    const converted = aed * curr.rate;
    const formatted = currency === "AED" || currency === "SAR"
      ? Math.round(converted).toLocaleString()
      : converted.toFixed(0);
    return `${curr.symbol} ${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, symbol: curr.symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);
