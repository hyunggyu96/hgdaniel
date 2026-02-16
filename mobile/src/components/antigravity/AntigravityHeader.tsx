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
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.title,
              { color: colors.textPrimary },
            ]}
          >
            {title}
          </Text>
          {showPulse && <PulseIndicator />}
          {badge !== undefined && (
            <View
              style={[styles.badge, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
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
    paddingBottom: 12,
    paddingTop: 8,
  },
  content: {
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
});
