import React from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { AnimatedFadeInView } from '@/components/motion/AnimatedFadeInView';
import { MOTION } from '@/theme/motion';

type AnimatedCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
};

export function AnimatedCard({ children, style, delay = 0 }: AnimatedCardProps) {
  return (
    <AnimatedFadeInView
      style={style}
      delay={delay}
      fromY={MOTION.distance.small}
      durationPreset="normal"
      springPreset="smooth"
    >
      {children}
    </AnimatedFadeInView>
  );
}

