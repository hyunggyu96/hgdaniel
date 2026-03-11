import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface GlassContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export function GlassContainer({
  children,
  style,
  intensity,
}: GlassContainerProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(255,255,255,0.85)",
          borderColor: colors.glassBorder,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    padding: 16,
  },
});
