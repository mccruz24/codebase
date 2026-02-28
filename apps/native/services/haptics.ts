import { Platform, Vibration } from 'react-native';

export type HapticIntent = 'selection' | 'success' | 'error' | 'destructive';

const HAPTIC_PATTERNS: Record<HapticIntent, number | number[]> = {
  selection: 8,
  success: [0, 14],
  error: [0, 22, 28, 18],
  destructive: [0, 28, 36, 24],
};

let enabled = true;

export function setHapticsEnabled(next: boolean) {
  enabled = next;
}

export function triggerHaptic(intent: HapticIntent, override?: { enabled?: boolean }) {
  if (Platform.OS === 'web') return;
  if (!enabled) return;
  if (override?.enabled === false) return;

  try {
    Vibration.vibrate(HAPTIC_PATTERNS[intent]);
  } catch {
    // no-op
  }
}

export const haptics = {
  selection: () => triggerHaptic('selection'),
  success: () => triggerHaptic('success'),
  error: () => triggerHaptic('error'),
  destructive: () => triggerHaptic('destructive'),
};
