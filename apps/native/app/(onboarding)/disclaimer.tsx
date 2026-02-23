import React, { useMemo, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Screen } from '@/components/Screen';
import { useProfile } from '@/contexts/ProfileContext';
import { UI_LAYOUT, getUiPalette } from '@/theme/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const REQUIRED_DISCLAIMER_VERSION = 1;

export default function Disclaimer() {
  const { profile, update } = useProfile();
  const palette = useMemo(() => getUiPalette(false), []);
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);

  const onAccept = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await update({
        disclaimer_version: REQUIRED_DISCLAIMER_VERSION,
        disclaimer_accepted_at: new Date().toISOString(),
      });
      router.replace('/');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen style={{ backgroundColor: palette.background }}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerWrap}>
          <View style={styles.badge}>
            <FontAwesome name="shield" size={14} color="#57534E" />
          </View>
          <Text style={styles.kicker}>Medical Disclaimer</Text>
          <Text style={styles.h1}>Please review before using Dosebase</Text>
          <Text style={styles.sub}>
            Dosebase is for informational and educational use only. It does not provide medical advice.
          </Text>
        </View>

        <View style={styles.cardStack}>
          <View style={[styles.noticeCard, { backgroundColor: '#FDF4C4', borderColor: '#FDE68A' }]}>
            <Text style={styles.noticeTitle}>Not medical advice</Text>
            <Text style={styles.noticeBody}>
              Any protocol decisions should be discussed with a licensed healthcare professional.
            </Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: '#FFFFFF', borderColor: '#E7E5E4' }]}>
            <Text style={styles.infoRow}>• Track responsibly and use accurate dosages.</Text>
            <Text style={styles.infoRow}>• Seek care immediately if symptoms worsen.</Text>
            <Text style={styles.infoRow}>• Keep your data private and securely backed up.</Text>
          </View>
        </View>

        <PrimaryButton label={saving ? 'Saving…' : 'I Understand'} onPress={onAccept} disabled={saving} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { gap: UI_LAYOUT.sectionGap },
  headerWrap: { gap: 8 },
  badge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FDF4C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    color: '#78716C',
  },
  h1: { fontSize: 30, fontWeight: '700', color: '#1C1917', letterSpacing: -0.3, lineHeight: 36 },
  sub: { fontSize: 14, fontWeight: '500', color: '#78716C', lineHeight: 20 },
  cardStack: { gap: 12 },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 6,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    color: '#57534E',
  },
  noticeBody: { color: '#57534E', fontSize: 14, fontWeight: '600', lineHeight: 20 },
  infoCard: {
    borderWidth: 1,
    borderRadius: UI_LAYOUT.cardRadiusMd,
    padding: 16,
    gap: 8,
  },
  infoRow: { color: '#57534E', fontSize: 14, fontWeight: '600', lineHeight: 19 },
});
