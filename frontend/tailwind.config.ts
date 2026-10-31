import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        cit: {
          50: "#F0F6FA",
          100: "#E2EEF5",
          200: "#C5DDEB",
          300: "#9EC4DC",
          400: "#5B93B5",
          500: "#2C6E8A",
          600: "#236B8E",
          700: "#1B5270",
          800: "#17445C",
          900: "#13374B",
          950: "#0C2331",
        },
        navy: {
          950: "#060913",
          900: "#0A0F1D",
          850: "#0D1527",
          800: "#111C35",
          700: "#1A294C",
          600: "#243763",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAFC",
          elevated: "#F1F5F9",
          border: "#E2E8F0",
          highlight: "#E2EEF5",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        card: "0 2px 8px -1px rgba(0, 0, 0, 0.06), 0 1px 4px -1px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 8px 20px -3px rgba(0, 0, 0, 0.08), 0 3px 6px -2px rgba(0, 0, 0, 0.04)",
        glow: "0 0 20px -3px rgba(35, 107, 142, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
