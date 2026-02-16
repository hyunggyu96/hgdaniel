import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { SpringPressable } from "@/components/antigravity";
import { useTheme } from "@/context/ThemeContext";
import { CATEGORY_COLORS } from "@/theme/colors";
import { QUICK_SPRING } from "@/theme/springs";

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  count?: number;
}

export function CategoryChip({
  label,
  selected,
  onPress,
  count,
}: CategoryChipProps) {
  const { colors, isDark } = useTheme();
  const color = CATEGORY_COLORS[label] || colors.primary;

  return (
    <SpringPressable onPress={onPress} haptic="selection">
      <View
        style={[
          styles.chip,
          {
            backgroundColor: selected
              ? `${color}20`
              : isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.04)",
            borderColor: selected ? color : "transparent",
          },
        ]}
      >
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text
          style={[
            styles.label,
            { color: selected ? color : colors.textSecondary },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {count !== undefined && (
          <Text style={[styles.count, { color: colors.textMuted }]}>
            {count}
          </Text>
        )}
      </View>
    </SpringPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  count: {
    fontSize: 11,
  },
});
