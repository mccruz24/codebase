import { Easing, type WithSpringConfig, type WithTimingConfig } from 'react-native-reanimated';
import { MOTION, type MotionDurationPreset, type MotionSpringPreset } from '@/theme/motion';

export function getSpringConfig(
  preset: MotionSpringPreset = 'snappy',
  reduceMotion = false
): WithSpringConfig {
  if (reduceMotion) {
    return {
      damping: 100,
      stiffness: 1000,
      mass: 1,
      overshootClamping: true,
    };
  }

  return MOTION.spring[preset];
}

export function getTimingConfig(
  preset: MotionDurationPreset = 'normal',
  reduceMotion = false
): WithTimingConfig {
  return {
    duration: reduceMotion ? MOTION.duration.instant : MOTION.duration[preset],
    easing: Easing.out(Easing.cubic),
  };
}

