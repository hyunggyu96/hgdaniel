import { Platform } from "react-native";

const FONT_FAMILY = Platform.select({
  ios: "System",
  android: "NotoSansKR_400Regular",
  default: "System",
});

export const TYPOGRAPHY = {
  largeTitle: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.5 },
  title1: { fontSize: 24, fontWeight: "700" as const, letterSpacing: -0.3 },
  title2: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.2 },
  title3: { fontSize: 17, fontWeight: "600" as const },
  headline: { fontSize: 15, fontWeight: "600" as const },
  body: { fontSize: 15, fontWeight: "400" as const },
  callout: { fontSize: 14, fontWeight: "400" as const },
  subhead: { fontSize: 13, fontWeight: "400" as const },
  footnote: { fontSize: 12, fontWeight: "400" as const },
  caption1: { fontSize: 11, fontWeight: "400" as const },
  caption2: { fontSize: 10, fontWeight: "600" as const, letterSpacing: 0.5 },
};

export { FONT_FAMILY };
