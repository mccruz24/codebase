import React from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { getSpringConfig, getTimingConfig } from '@/lib/motion';
import { useReduceMotion } from '@/hooks/useReduceMotion';
import { MOTION, type MotionSpringPreset } from '@/theme/motion';

type AnimatedPressableProps = Omit<PressableProps, 'style' | 'children'> & {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  pressedScale?: number;
  pressedOpacity?: number;
  springPreset?: MotionSpringPreset;
};

export function AnimatedPressable({
  children,
  style,
  containerStyle,
  pressedScale = MOTION.scale.pressed,
  pressedOpacity = MOTION.opacity.pressed,
  springPreset = 'snappy',
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: AnimatedPressableProps) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn: PressableProps['onPressIn'] = (event) => {
    if (!disabled) {
      scale.value = reduceMotion
        ? withTiming(1, getTimingConfig('instant', true))
        : withSpring(pressedScale, getSpringConfig(springPreset, false));
      opacity.value = withTiming(pressedOpacity, getTimingConfig('fast', reduceMotion));
    }
    onPressIn?.(event);
  };

  const handlePressOut: PressableProps['onPressOut'] = (event) => {
    scale.value = reduceMotion
      ? withTiming(1, getTimingConfig('instant', true))
      : withSpring(1, getSpringConfig(springPreset, false));
    opacity.value = withTiming(1, getTimingConfig('fast', reduceMotion));
    onPressOut?.(event);
  };

  if (children === undefined || children === null) {
    return (
      <Pressable
        {...rest}
        disabled={disabled}
        style={[containerStyle, style]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      />
    );
  }

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      style={containerStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
