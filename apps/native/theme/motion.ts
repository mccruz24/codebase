export const MOTION = {
  duration: {
    instant: 90,
    fast: 140,
    normal: 220,
    slow: 320,
  },
  distance: {
    micro: 4,
    small: 8,
    medium: 16,
    large: 24,
  },
  spring: {
    snappy: { damping: 22, stiffness: 340, mass: 0.85, overshootClamping: false },
    smooth: { damping: 26, stiffness: 240, mass: 0.95, overshootClamping: false },
    gentle: { damping: 30, stiffness: 180, mass: 1, overshootClamping: false },
  },
  opacity: {
    pressed: 0.86,
    disabled: 0.45,
  },
  scale: {
    pressed: 0.97,
    cardPressed: 0.985,
    selectedBump: 1.03,
  },
} as const;

export type MotionSpringPreset = keyof typeof MOTION.spring;
export type MotionDurationPreset = keyof typeof MOTION.duration;

