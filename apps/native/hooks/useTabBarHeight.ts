import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Returns the total bottom padding needed so scroll content clears the
 * floating tab bar on every iPhone model.
 *
 * Tab bar layout (from _layout.tsx):
 *   height: 64px
 *   bottom: 24px  (distance from screen bottom)
 *
 * So the bar's top edge sits at: insets.bottom + 24 + 64 from the screen bottom.
 * We add 16px breathing room above the bar.
 */
export function useTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + 64 + 24 + 16;
}
