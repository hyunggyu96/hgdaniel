/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#3182f6",
        "primary-light": "#60a5fa",
        "primary-dark": "#1d4ed8",
        // Dark mode surfaces
        "dark-bg": "#0a0a12",
        "dark-surface": "rgba(255,255,255,0.05)",
        "dark-elevated": "rgba(255,255,255,0.08)",
        "dark-glass": "rgba(255,255,255,0.12)",
        // Light mode surfaces
        "light-bg": "#f8f9fb",
        "light-surface": "rgba(0,0,0,0.03)",
        "light-elevated": "rgba(0,0,0,0.05)",
        "light-glass": "rgba(0,0,0,0.06)",
        // Category colors
        "cat-filler": "#3182f6",
        "cat-botox": "#10b981",
        "cat-collagen": "#f59e0b",
        "cat-exosome": "#ec4899",
        "cat-pdrn": "#8b5cf6",
        "cat-skinbooster": "#06b6d4",
        "cat-machine": "#f97316",
        "cat-corporate": "#94a3b8",
      },
      fontFamily: {
        sans: ["NotoSansKR_400Regular"],
        "sans-medium": ["NotoSansKR_500Medium"],
        "sans-bold": ["NotoSansKR_700Bold"],
      },
    },
  },
  plugins: [],
};
