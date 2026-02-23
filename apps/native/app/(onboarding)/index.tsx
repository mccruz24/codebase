import React, { useMemo, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useProfile } from '@/contexts/ProfileContext';
import { UI_LAYOUT, getUiPalette } from '@/theme/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const REQUIRED_ONBOARDING_VERSION = 1;

export default function Onboarding() {
  const { profile, update } = useProfile();
  const palette = useMemo(() => getUiPalette(false), []);
  const insets = useSafeAreaInsets();
  const [units, setUnits] = useState<'imperial' | 'metric'>(profile?.units ?? 'imperial');
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(profile?.theme ?? 'system');
  const [saving, setSaving] = useState(false);

  const onContinue = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await update({
        units,
        theme,
        onboarding_completed: true,
        onboarding_version: REQUIRED_ONBOARDING_VERSION,
      });
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen style={{ backgroundColor: palette.background }}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>ME</Text>
          </View>
          <Pressable onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <View style={{ gap: 6 }}>
          <Text style={styles.h1}>Ready to personalize Dosebase</Text>
          <Text style={styles.sub}>Set your preferences so the app feels right from the first session.</Text>
        </View>

        <View style={[styles.progressWrap, { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
          <Text style={styles.progressText}>2 / 2</Text>
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
          <View style={{ gap: 10 }}>
            <Text style={styles.label}>Units</Text>
            <View style={styles.segment}>
              <SegmentButton
                label="Imperial"
                active={units === 'imperial'}
                onPress={() => setUnits('imperial')}
              />
              <SegmentButton
                label="Metric"
                active={units === 'metric'}
                onPress={() => setUnits('metric')}
              />
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <Text style={styles.label}>Appearance</Text>
            <View style={styles.segment}>
              <SegmentButton
                label="System"
                icon="desktop"
                active={theme === 'system'}
                onPress={() => setTheme('system')}
              />
              <SegmentButton
                label="Light"
                icon="sun-o"
                active={theme === 'light'}
                onPress={() => setTheme('light')}
              />
              <SegmentButton
                label="Dark"
                icon="moon-o"
                active={theme === 'dark'}
                onPress={() => setTheme('dark')}
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label={saving ? 'Saving…' : 'Continue'} onPress={onContinue} disabled={saving} />
        </View>
      </ScrollView>
    </Screen>
  );
}

function SegmentButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.segBtn, active && styles.segBtnActive]}>
      {icon ? <FontAwesome name={icon} size={12} color={active ? '#FFFFFF' : '#64748B'} /> : null}
      <Text style={[styles.segText, active && styles.segTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: { gap: UI_LAYOUT.sectionGap },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#1C1917', fontSize: 13, fontWeight: '700' },
  skipText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  h1: { fontSize: 30, fontWeight: '700', color: '#0F172A', letterSpacing: -0.3 },
  sub: { fontSize: 14, fontWeight: '500', color: '#64748B', lineHeight: 20 },
  progressWrap: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#CBE4F9',
  },
  card: {
    borderRadius: UI_LAYOUT.cardRadiusLg,
    borderWidth: 1,
    padding: 22,
    gap: 18,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  segBtn: {
    flex: 1,
    minHeight: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  segBtnActive: { backgroundColor: '#1C1917' },
  segText: { fontWeight: '700', color: '#64748B', fontSize: 12 },
  segTextActive: { color: '#FFFFFF' },
  footer: { paddingTop: 4 },
});
