import { format, isBefore, startOfDay, isSameDay } from "date-fns";

export const STEPS = [
  { n: 1, label: "Schedule",     key: "schedule", icon: "📅" },
  { n: 2, label: "Guests",       key: "guests",   icon: "👥" },
  { n: 3, label: "Guest Info",    key: "info",     icon: "✍️" },
  { n: 4, label: "Review",       key: "review",   icon: "🔍" },
  { n: 5, label: "Payment",      key: "payment",  icon: "💳" },
];

export const parseDuration = (d: string): number => {
  const normalized = d.toLowerCase();
  if (normalized.includes("full day")) return 600; // 10 hrs
  if (normalized.includes("half day")) return 240; // 4 hrs
  
  const match = normalized.match(/(\d+)/);
  if (!match) return 60; // default 1 hr
  const val = parseInt(match[1]);
  if (normalized.includes("hour")) return val * 60;
  return val; // assumed minutes
};

export const timeToMins = (timeStr: string): number => {
  const clean = timeStr.toUpperCase().trim();
  const match = clean.match(/(\d+):?(\d+)?\s*(AM|PM)?/);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const ampm = match[3];

  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};
