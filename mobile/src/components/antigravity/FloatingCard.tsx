import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/context/ThemeContext";
import { ANTIGRAVITY_SPRING, STAGGER_DELAY } from "@/theme/springs";

interface FloatingCardProps {
  children: React.ReactNode;
  index?: number;
  style?: ViewStyle;
  noPadding?: boolean;
}

export function FloatingCard({
  children,
  index = 0,
  style,
  noPadding,
}: FloatingCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.springify()
        .damping(ANTIGRAVITY_SPRING.damping!)
        .mass(ANTIGRAVITY_SPRING.mass!)
        .stiffness(ANTIGRAVITY_SPRING.stiffness!)
        .delay(index * STAGGER_DELAY)}
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(255,255,255,0.9)",
          borderColor: colors.glassBorder,
          shadowColor: colors.cardShadow,
        },
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  padding: {
    padding: 16,
  },
});
