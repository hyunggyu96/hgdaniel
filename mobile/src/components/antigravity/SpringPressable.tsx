import React from "react";
import { Pressable, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useHaptics } from "@/hooks/useHaptics";
import { BOUNCY_SPRING, QUICK_SPRING } from "@/theme/springs";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SpringPressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  haptic?: "light" | "medium" | "selection" | "none";
  disabled?: boolean;
}

export function SpringPressable({
  children,
  onPress,
  style,
  haptic = "light",
  disabled,
}: SpringPressableProps) {
  const scale = useSharedValue(1);
  const haptics = useHaptics();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, QUICK_SPRING);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, BOUNCY_SPRING);
  };

  const handlePress = () => {
    if (haptic !== "none") {
      haptics[haptic]();
    }
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}
