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
        campus: {
          bg: "#0A0A0F",
          panel: "#120A0A",
          input: "#1A0D0D",
          accent: "#C0392B",
          accentHi: "#E74C3C",
          glow: "#FF2D2D",
          text: "#F5F5F5",
          muted: "#A89090",
          label: "#FF6B6B",
        },
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 12px rgba(255, 45, 45, 0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
