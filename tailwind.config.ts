import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        s: {
          0: "#070706", 1: "#0D0C09", 2: "#14120D",
          3: "#1C1912", 4: "#242017", 5: "#2D281A",
        },
        g: {
          100: "#F5E0A0", 200: "#ECC86A",
          300: "#D4962A", 400: "#B87620",
          500: "#965C14", 600: "#6E420C",
        },
      },
      fontFamily: {
        display: ["var(--fd)", "Georgia", "serif"],
        body:    ["var(--fb)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold:     "0 0 40px rgba(212,150,42,0.28), 0 4px 16px rgba(212,150,42,0.18)",
        "gold-lg":"0 12px 48px rgba(212,150,42,0.38)",
        card:     "0 2px 16px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4)",
        hover:    "0 32px 80px rgba(0,0,0,0.75), 0 12px 28px rgba(0,0,0,0.5)",
        panel:    "0 0 60px rgba(0,0,0,0.6), -8px 0 40px rgba(0,0,0,0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
