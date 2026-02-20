export const CATEGORY_COLORS: Record<string, string> = {
  Filler: "#3182f6",
  "Botulinum Toxin": "#10b981",
  "Collagen Stimulator": "#f59e0b",
  Exosome: "#ec4899",
  "PDRN/PN": "#8b5cf6",
  "Skinboosters/Threads": "#06b6d4",
  "Energy-Based Devices": "#f97316",
  "Corporate News": "#94a3b8",
};

export const LIGHT_THEME = {
  background: "#f8f9fb",
  surface: "#ffffff",
  surfaceElevated: "#ffffff",
  glass: "rgba(255,255,255,0.85)",
  glassBorder: "rgba(0,0,0,0.06)",
  primary: "#3182f6",
  primaryLight: "#60a5fa",
  primaryDark: "#1d4ed8",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  border: "#e5e7eb",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  tabBar: "rgba(255,255,255,0.92)",
  cardShadow: "rgba(0,0,0,0.08)",
  statusBar: "dark" as const,
  blurTint: "light" as const,
  blurIntensity: 80,
};

export const DARK_THEME = {
  background: "#0a0a12",
  surface: "rgba(255,255,255,0.05)",
  surfaceElevated: "rgba(255,255,255,0.08)",
  glass: "rgba(255,255,255,0.12)",
  glassBorder: "rgba(255,255,255,0.1)",
  primary: "#3182f6",
  primaryLight: "#60a5fa",
  primaryDark: "#1d4ed8",
  textPrimary: "#ffffff",
  textSecondary: "rgba(255,255,255,0.7)",
  textMuted: "rgba(255,255,255,0.4)",
  border: "rgba(255,255,255,0.1)",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  tabBar: "rgba(10,10,18,0.92)",
  cardShadow: "rgba(0,0,0,0.4)",
  statusBar: "light" as const,
  blurTint: "dark" as const,
  blurIntensity: 60,
};

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  glass: string;
  glassBorder: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  tabBar: string;
  cardShadow: string;
  statusBar: "light" | "dark";
  blurTint: "light" | "dark";
  blurIntensity: number;
};
