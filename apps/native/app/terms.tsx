import React, { useMemo } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { useColorScheme } from '@/components/useColorScheme';
import { UI_LAYOUT, getUiPalette } from '@/theme/ui';

const TERMS_SECTIONS = [
  {
    title: '1. Purpose',
    body: 'Aesthetic Logbook is a personal documentation tool designed for logging wellness protocols and subjective metrics. It is not a medical device, and does not provide medical advice, diagnosis, or treatment recommendations.',
  },
  {
    title: '2. User Responsibility',
    body: 'You are solely responsible for any health-related decisions you make. Always consult a qualified healthcare professional before starting, modifying, or stopping any treatment or protocol.',
  },
  {
    title: '3. Data Ownership',
    body: 'All data entered into the application is stored securely via your personal account. We do not share or sell your personal data. You retain full ownership and control of your data.',
  },
  {
    title: '4. No Warranty',
    body: 'This application is provided "as is" without any warranty of any kind. We do not guarantee the accuracy, completeness, or usefulness of any information provided within the app.',
  },
  {
    title: '5. Limitation of Liability',
    body: 'Under no circumstances shall the developers of Aesthetic Logbook be held liable for any damages arising from the use or inability to use this application.',
  },
  {
    title: '6. Changes to Terms',
    body: 'We reserve the right to modify these terms at any time. Continued use of the application after changes constitutes acceptance of the updated terms.',
  },
];

export default function TermsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = useMemo(() => getUiPalette(isDark), [isDark]);
  const insets = useSafeAreaInsets();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: UI_LAYOUT.tabPageTopPadding, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.navButton,
              { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' },
            ]}
          >
            <FontAwesome name="chevron-left" size={14} color={palette.textMuted} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Terms of Use</Text>
            <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}>LEGAL</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content card */}
        <View
          style={[
            styles.contentCard,
            { backgroundColor: palette.card, borderColor: palette.cardBorder },
          ]}
        >
          {/* Section label */}
          <View style={styles.sectionLabelRow}>
            <FontAwesome name="file-text-o" size={14} color={palette.textMuted} />
            <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>AGREEMENT</Text>
          </View>

          <Text style={[styles.introText, { color: palette.textSecondary }]}>
            By using Aesthetic Logbook, you agree to the following terms and conditions. Please read
            them carefully before using this application.
          </Text>

          {TERMS_SECTIONS.map((section, idx) => (
            <View key={idx} style={styles.termItem}>
              <Text style={[styles.termTitle, { color: palette.textPrimary }]}>{section.title}</Text>
              <Text style={[styles.termBody, { color: palette.textSecondary }]}>{section.body}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: palette.textMuted }]}>
            Last updated: February 2025
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { gap: UI_LAYOUT.sectionGap },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center', gap: 2 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSubtitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  headerSpacer: { width: 40 },

  contentCard: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 24,
    gap: 16,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
        }
      : {}),
  },

  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },

  introText: { fontSize: 13, fontWeight: '500', lineHeight: 20 },

  termItem: { gap: 4 },
  termTitle: { fontSize: 14, fontWeight: '700' },
  termBody: { fontSize: 13, fontWeight: '500', lineHeight: 20 },

  footer: { alignItems: 'center', paddingVertical: 8 },
  footerText: { fontSize: 10, fontWeight: '500' },
});
