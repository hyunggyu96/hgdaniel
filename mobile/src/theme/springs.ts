import { WithSpringConfig } from "react-native-reanimated";

/** Default animation for card entrances and floating elements */
export const ANTIGRAVITY_SPRING: WithSpringConfig = {
  damping: 10,
  mass: 0.5,
  stiffness: 100,
};

/** Press feedback — slightly bouncier */
export const BOUNCY_SPRING: WithSpringConfig = {
  damping: 8,
  mass: 0.4,
  stiffness: 120,
};

/** Fast response for tab switches and toggles */
export const QUICK_SPRING: WithSpringConfig = {
  damping: 20,
  mass: 0.5,
  stiffness: 200,
};

/** Gentle float for subtle ambient motion */
export const GENTLE_SPRING: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 80,
};

/** Stagger delay between list items (ms) */
export const STAGGER_DELAY = 60;
