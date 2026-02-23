import React, { useMemo, useState } from 'react';
import { Link, router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Screen } from '@/components/Screen';
import { useColorScheme } from '@/components/useColorScheme';
import { supabase } from '@/lib/supabase';
import { getUiPalette } from '@/theme/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignIn() {
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = useMemo(() => getUiPalette(isDark), [isDark]);
  const insets = useSafeAreaInsets();

  const onSubmit = async () => {
    if (!supabase) {
      setError('Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY in apps/native/.env');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      {/* Background blobs */}
      <View style={[styles.blobTopRight, { backgroundColor: isDark ? 'rgba(191,234,98,0.08)' : '#EAF7C9' }]} />
      <View style={[styles.blobCenterLeft, { backgroundColor: isDark ? 'rgba(203,228,249,0.08)' : 'rgba(203,228,249,0.6)' }]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Collage */}
          <View style={styles.heroArea}>
            <View style={[styles.heroBaseShape, { backgroundColor: isDark ? '#1A2E10' : '#EAF7C9' }]} />
            {/* Left card */}
            <View style={[styles.heroCardLeft, { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24 }]}>
              <View style={styles.heroCardLeftGradientA} />
              <View style={styles.heroCardLeftGradientB} />
              <View style={[styles.heroChipBottom, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
                <FontAwesome name="eyedropper" size={12} color="#1C1917" />
                <Text style={styles.heroChipText}>Protocols</Text>
              </View>
            </View>
            {/* Right card */}
            <View style={[styles.heroCardRight, { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24 }]}>
              <View style={styles.heroCardRightGradientA} />
              <View style={styles.heroCardRightGradientB} />
              <View style={[styles.heroChipTop, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
                <FontAwesome name="line-chart" size={12} color="#1C1917" />
                <Text style={styles.heroChipText}>Trends</Text>
              </View>
            </View>
            {/* Floating icon chips */}
            <View style={[styles.floatingChip1, { backgroundColor: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.6)', borderWidth: 1 }]}>
              <FontAwesome name="shield" size={14} color="#78716C" />
            </View>
            <View style={[styles.floatingChip2, { backgroundColor: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.6)', borderWidth: 1 }]}>
              <FontAwesome name="th" size={14} color="#78716C" />
            </View>
            {/* Page indicator dots */}
            <View style={styles.heroDots}>
              <View style={styles.heroDotActive} />
              <View style={styles.heroDotInactive} />
              <View style={styles.heroDotInactive} />
            </View>
          </View>

          {/* Copy */}
          <View style={styles.copySection}>
            <Text style={[styles.copyTitle, { color: palette.textPrimary }]}>Welcome back</Text>
            <Text style={[styles.copySubtitle, { color: palette.textMuted }]}>
              Sign in to your Dosebase account to continue tracking your protocols.
            </Text>
          </View>

          {/* Auth Card */}
          <View style={[styles.authCard, {
            backgroundColor: isDark ? 'rgba(28,25,23,0.9)' : 'rgba(255,255,255,0.9)',
            borderColor: isDark ? '#292524' : 'rgba(255,255,255,0.5)',
          }]}>
            {error ? (
              <View style={styles.errorBanner}>
                <FontAwesome name="exclamation-circle" size={13} color="#B91C1C" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View>
              <Text style={[styles.fieldLabel, { color: palette.textMuted }]}>EMAIL</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={isDark ? '#78716C' : '#D6D3D1'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.roundInput, {
                  color: palette.textPrimary,
                  backgroundColor: isDark ? 'rgba(41,37,36,0.8)' : 'rgba(250,250,249,0.8)',
                  borderColor: isDark ? '#3D3835' : '#F0EDEB',
                }]}
              />
            </View>

            {/* Password */}
            <View>
              <View style={styles.passwordLabelRow}>
                <Text style={[styles.fieldLabel, { color: palette.textMuted }]}>PASSWORD</Text>
                <Text style={styles.forgotLink}>Forgot password?</Text>
              </View>
              <View style={{ position: 'relative' }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? '#78716C' : '#D6D3D1'}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={[styles.roundInput, {
                    color: palette.textPrimary,
                    backgroundColor: isDark ? 'rgba(41,37,36,0.8)' : 'rgba(250,250,249,0.8)',
                    borderColor: isDark ? '#3D3835' : '#F0EDEB',
                    paddingRight: 56,
                  }]}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <FontAwesome name={showPassword ? 'eye-slash' : 'eye'} size={16} color={palette.textMuted} />
                </Pressable>
              </View>
            </View>

            {/* Primary CTA */}
            <Pressable
              onPress={onSubmit}
              disabled={loading}
              style={[styles.authCTA, loading && { opacity: 0.8 }]}
            >
              <Text style={styles.authCTAText}>{loading ? 'Signing in…' : 'Sign in'}</Text>
            </Pressable>

            {/* Secondary CTA */}
            <Link href="/(auth)/sign-up" asChild>
              <Pressable style={[styles.secondaryCTA, {
                backgroundColor: isDark ? 'rgba(41,37,36,0.5)' : '#FAFAF9',
                borderColor: isDark ? '#3D3835' : '#E7E5E4',
              }]}>
                <Text style={[styles.secondaryCTAText, { color: isDark ? '#E7E5E4' : '#44403C' }]}>
                  Create an account
                </Text>
              </Pressable>
            </Link>
          </View>

          {/* Footer */}
          <Text style={[styles.footerDisclaimer, { color: palette.textMuted }]}>
            For educational and informational purposes only. Not medical advice.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  blobTopRight: {
    position: 'absolute',
    width: 288,
    height: 288,
    borderRadius: 144,
    top: -96,
    right: -96,
    opacity: 0.7,
  },
  blobCenterLeft: {
    position: 'absolute',
    width: 288,
    height: 288,
    borderRadius: 144,
    top: 160,
    left: -80,
    opacity: 0.5,
  },
  heroArea: {
    height: 256,
    marginTop: 12,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBaseShape: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 56,
    transform: [{ rotate: '-8deg' }],
  },
  heroCardLeft: {
    position: 'absolute',
    left: 24,
    top: 24,
    width: 176,
    height: 176,
    borderRadius: 34,
    transform: [{ rotate: '-7deg' }],
    overflow: 'hidden',
    backgroundColor: '#F0F8FF',
  },
  heroCardLeftGradientA: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#CBE4F9',
    opacity: 0.4,
  },
  heroCardLeftGradientB: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#CDF5E3',
    opacity: 0.3,
  },
  heroCardRight: {
    position: 'absolute',
    right: 24,
    top: 64,
    width: 176,
    height: 176,
    borderRadius: 34,
    transform: [{ rotate: '8deg' }],
    overflow: 'hidden',
    backgroundColor: '#F8F0FF',
  },
  heroCardRightGradientA: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#E3DFFD',
    opacity: 0.4,
  },
  heroCardRightGradientB: {
    position: 'absolute',
    inset: 0,
    backgroundColor: '#F9D1D1',
    opacity: 0.3,
  },
  heroChipBottom: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  heroChipTop: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  heroChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1C1917',
  },
  floatingChip1: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    left: '35%',
    top: 12,
  },
  floatingChip2: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    right: '30%',
    bottom: 24,
  },
  heroDots: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroDotActive: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#BFEA62',
  },
  heroDotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E7E5E4',
  },
  copySection: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  copyTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  copySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  authCard: {
    borderRadius: 40,
    borderWidth: 1,
    padding: 28,
    gap: 16,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 30 },
          shadowOpacity: 0.1,
          shadowRadius: 80,
        }
      : {}),
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A8A29E',
  },
  roundInput: {
    height: 52,
    borderRadius: 999,
    paddingHorizontal: 20,
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 4,
    top: 6,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: '#F0EDEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authCTA: {
    height: 52,
    borderRadius: 999,
    backgroundColor: '#BFEA62',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#BFEA62',
          shadowOffset: { width: 0, height: 18 },
          shadowOpacity: 0.45,
          shadowRadius: 50,
        }
      : {}),
  },
  authCTAText: {
    color: '#1C1917',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryCTA: {
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryCTAText: {
    fontSize: 15,
    fontWeight: '800',
  },
  footerDisclaimer: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 15,
  },
});
