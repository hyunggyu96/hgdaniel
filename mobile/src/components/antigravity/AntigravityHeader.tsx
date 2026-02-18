import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { PulseIndicator } from "./PulseIndicator";

interface AntigravityHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string | number;
  showPulse?: boolean;
  children?: React.ReactNode;
}

export function AntigravityHeader({
  title,
  subtitle,
  badge,
  showPulse,
  children,
}: AntigravityHeaderProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? "rgba(10,10,18,0.95)"
            : "rgba(248,249,251,0.95)",
        },
      ]}
    >
      <View style={styles.content}>
        {/* Live Indicator Row */}
        {badge === "Live" ? (
          <View style={styles.liveRow}>
            <PulseIndicator color="#4ade80" size={5} />
            <Text style={[styles.liveText, { color: "#4ade80" }]}>Live</Text>
          </View>
        ) : badge !== undefined ? (
          <View style={styles.topBadgeRow}>
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          </View>
        ) : null}

        {/* Main Title */}
        <Text
          style={[
            styles.title,
            { color: colors.textPrimary },
          ]}
        >
          {title.startsWith("AI ") ? (
            <>
              <Text style={{ fontWeight: "300" }}>AI </Text>
              {title.slice(3)}
            </>
          ) : (
            title
          )}
        </Text>

        {/* Subtitle */}
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}

        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 12,
  },
  content: {
    gap: 4,
    alignItems: "center",
  },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 2,
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topBadgeRow: {
    marginBottom: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
    textAlign: "center",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});
