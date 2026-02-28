import React, { useEffect } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { getSpringConfig, getTimingConfig } from '@/lib/motion';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { MOTION, type MotionDurationPreset, type MotionSpringPreset } from '@/theme/motion';

type AnimatedFadeInViewProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
  fromY?: number;
  durationPreset?: MotionDurationPreset;
  springPreset?: MotionSpringPreset;
};

export function AnimatedFadeInView({
  children,
  style,
  delay = 0,
  fromY = MOTION.distance.small,
  durationPreset = 'normal',
  springPreset = 'smooth',
}: AnimatedFadeInViewProps) {
  const reduceMotion = useReduceMotion();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(reduceMotion ? 0 : fromY);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, getTimingConfig(durationPreset, reduceMotion));
      translateY.value = reduceMotion
        ? withTiming(0, getTimingConfig('fast', true))
        : withSpring(0, getSpringConfig(springPreset, false));
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, durationPreset, opacity, reduceMotion, springPreset, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

