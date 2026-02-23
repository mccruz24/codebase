import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { getUiPalette } from '@/theme/ui';

export function PrimaryButton({
  label,
  onPress,
  disabled,
  tone,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'default' | 'auth';
}) {
  const scheme = useColorScheme();
  const palette = getUiPalette(scheme === 'dark');
  const isAuthTone = tone === 'auth';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isAuthTone ? '#BFEA62' : palette.primary,
          shadowColor: isAuthTone ? '#BFEA62' : '#1C1917',
        },
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Text style={[styles.text, { color: isAuthTone ? '#1C1917' : palette.primaryText }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700',
    fontSize: 18,
  },
});
