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
        veto: {
          gold: "#B08401",
          goldHover: "#966F01",
          goldLight: "#FBF6EA",
          goldBorder: "#ECD693",
          rose: "#D49E8D",
          roseLight: "#FAF3F1",
          roseBorder: "#EAC8BF",
          sand: "#DED1BD",
          sandLight: "#F8F4EE",
          sandBorder: "#E8DFD5",
          cream: "#FAF6F2",
          brown: "#683B2B",
          brownHover: "#563124",
          brownDark: "#42261C",
          brownLight: "#F7F2F0",
          brownBorder: "#DCC4BB",
        },
        cit: {
          50: "#FAF6F2",
          100: "#F8F4EE",
          200: "#E8DFD5",
          300: "#DED1BD",
          400: "#D49E8D",
          500: "#B08401",
          600: "#966F01",
          700: "#683B2B",
          800: "#563124",
          900: "#42261C",
          950: "#1F120D",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#FAF6F2",
          elevated: "#F8F4EE",
          border: "#E8DFD5",
          highlight: "#FBF6EA",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(104, 59, 43, 0.05), 0 1px 2px -1px rgba(104, 59, 43, 0.05)",
        card: "0 2px 8px -1px rgba(104, 59, 43, 0.06), 0 1px 4px -1px rgba(104, 59, 43, 0.04)",
        "card-hover": "0 8px 20px -3px rgba(104, 59, 43, 0.12), 0 3px 6px -2px rgba(104, 59, 43, 0.06)",
        glow: "0 0 24px -2px rgba(176, 132, 1, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
