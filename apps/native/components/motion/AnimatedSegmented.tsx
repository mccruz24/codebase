import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { AnimatedPressable } from '@/components/motion/AnimatedPressable';
import { MOTION } from '@/theme/motion';

type SegmentedOption = {
  key: string;
  label: string;
};

type AnimatedSegmentedProps = {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  backgroundColor: string;
  activeBackgroundColor: string;
  activeTextColor: string;
  textColor: string;
};

export function AnimatedSegmented({
  options,
  value,
  onChange,
  style,
  backgroundColor,
  activeBackgroundColor,
  activeTextColor,
  textColor,
}: AnimatedSegmentedProps) {
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {options.map((option) => {
        const active = option.key === value;
        return (
          <AnimatedPressable
            key={option.key}
            onPress={() => onChange(option.key)}
            pressedScale={MOTION.scale.pressed}
            style={[
              styles.item,
              active ? { backgroundColor: activeBackgroundColor } : null,
            ]}
          >
            <Text style={[styles.itemText, { color: active ? activeTextColor : textColor }]}>
              {option.label}
            </Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  item: {
    flex: 1,
    minHeight: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  itemText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

