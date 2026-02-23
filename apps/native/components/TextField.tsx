import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { getUiPalette } from '@/theme/ui';

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
}) {
  const scheme = useColorScheme();
  const palette = getUiPalette(scheme === 'dark');
  return (
    <View style={styles.root}>
      <Text style={[styles.label, { color: palette.textMuted }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? 'none'}
        keyboardType={keyboardType ?? 'default'}
        style={[styles.input, { backgroundColor: palette.card, color: palette.textPrimary, borderColor: palette.cardBorder }]}
        placeholderTextColor={palette.textMuted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginLeft: 2,
  },
  input: {
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
  },
});
