import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useColorScheme } from '@/components/useColorScheme';
import { UI_LAYOUT, getUiPalette } from '@/theme/ui';

export default function NotFoundScreen() {
  const scheme = useColorScheme();
  const palette = getUiPalette(scheme === 'dark');
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Screen>
        <View style={styles.container}>
          <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
            <View style={[styles.iconWrap, { backgroundColor: palette.field }]}>
              <FontAwesome name="map-signs" size={20} color={palette.textMuted} />
            </View>
            <Text style={[styles.title, { color: palette.textPrimary }]}>Page not found</Text>
            <Text style={[styles.body, { color: palette.textMuted }]}>
              This route is outside the current native rewrite scope.
            </Text>
            <Link href="/(tabs)" style={styles.link}>
              <Text style={styles.linkText}>Go to Dashboard</Text>
            </Link>
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
  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: UI_LAYOUT.cardRadiusLg,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    marginTop: 6,
    minHeight: 44,
    borderRadius: 20,
    backgroundColor: '#1C1917',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
