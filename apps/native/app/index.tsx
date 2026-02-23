import React from 'react';
import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useColorScheme } from '@/components/useColorScheme';
import { getUiPalette } from '@/theme/ui';

const REQUIRED_DISCLAIMER_VERSION = 1;
const REQUIRED_ONBOARDING_VERSION = 1;

export default function Index() {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const scheme = useColorScheme();
  const palette = getUiPalette(scheme === 'dark');

  if (loading || profileLoading) {
    return (
      <Screen>
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={palette.textSecondary} />
          <Text style={[styles.loadingText, { color: palette.textMuted }]}>Loading…</Text>
        </View>
      </Screen>
    );
  }

  if (!user) return <Redirect href="/(auth)/sign-in" />;
  if (profileError) {
    return (
      <Screen>
        <View style={styles.centerWrap}>
          <Text style={[styles.errorTitle, { color: palette.textPrimary }]}>Couldn’t load profile</Text>
          <Text style={[styles.errorBody, { color: palette.textMuted }]}>{profileError}</Text>
        </View>
      </Screen>
    );
  }
  if (!profile) return <Redirect href="/(auth)/sign-in" />;

  if ((profile.disclaimer_version ?? 0) < REQUIRED_DISCLAIMER_VERSION) {
    return <Redirect href="/(onboarding)/disclaimer" />;
  }

  if (
    !profile.onboarding_completed ||
    (profile.onboarding_version ?? 0) < REQUIRED_ONBOARDING_VERSION
  ) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  loadingText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  errorTitle: { fontSize: 20, fontWeight: '700' },
  errorBody: { fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18 },
});
