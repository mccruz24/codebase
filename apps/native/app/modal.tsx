import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useColorScheme } from '@/components/useColorScheme';
import { UI_LAYOUT, getUiPalette } from '@/theme/ui';

export default function ModalScreen() {
  const scheme = useColorScheme();
  const palette = getUiPalette(scheme === 'dark');
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <Screen>
        <View style={styles.container}>
          <View style={[styles.modalCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, { color: palette.textPrimary }]}>Dosebase Modal</Text>
              <Pressable
                onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
                style={[styles.closeButton, { backgroundColor: palette.field }]}
              >
                <FontAwesome name="close" size={14} color={palette.textMuted} />
              </Pressable>
            </View>
            <Text style={[styles.body, { color: palette.textSecondary }]}>
              This modal route is now styled with the same visual language as the rest of the app.
            </Text>
          </View>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: UI_LAYOUT.cardRadiusLg,
    padding: 22,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
