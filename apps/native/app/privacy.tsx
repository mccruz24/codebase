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

const PRIVACY_SECTIONS = [
  {
    title: 'Data Storage',
    body: 'All data you enter into Aesthetic Logbook is stored securely via your personal account. Your data is protected and only accessible by you.',
  },
  {
    title: 'Data Collection',
    body: 'We collect only the minimum data necessary to provide the service — your email for authentication and the logs you choose to enter. We do not collect usage analytics or telemetry data.',
  },
  {
    title: 'Data Sharing',
    body: 'We do not share, sell, or transfer any user data to third parties. Your personal health logs remain private and under your control.',
  },
  {
    title: 'Data Control',
    body: 'You have full control over your data at all times. You can export your data as a JSON file for backup, or completely erase all stored data through the Settings page.',
  },
  {
    title: 'Cookies & Tracking',
    body: 'Aesthetic Logbook does not use cookies, tracking pixels, or any form of user tracking technology.',
  },
  {
    title: 'Third-Party Services',
    body: 'The application uses Supabase for secure authentication and data storage. These services have their own privacy policies. No unnecessary user data is shared with these services.',
  },
  {
    title: 'Contact',
    body: 'If you have any questions about this privacy policy, please reach out at help@aestheticlog.com.',
  },
];

export default function PrivacyScreen() {
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
            <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Privacy Policy</Text>
            <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}>LEGAL</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Privacy First Banner */}
        <View
          style={[
            styles.banner,
            {
              backgroundColor: isDark ? 'rgba(205,245,227,0.1)' : 'rgba(205,245,227,0.3)',
              borderColor: isDark ? 'rgba(205,245,227,0.2)' : 'rgba(205,245,227,0.5)',
            },
          ]}
        >
          <View style={styles.bannerIconWrap}>
            <FontAwesome name="shield" size={16} color={isDark ? '#A8A29E' : '#57534E'} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.bannerTitle, { color: palette.textPrimary }]}>Privacy First</Text>
            <Text style={[styles.bannerBody, { color: palette.textSecondary }]}>
              Your data is private and secure. We never share or sell your personal information.
            </Text>
          </View>
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
            <FontAwesome name="lock" size={14} color={palette.textMuted} />
            <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>PRIVACY POLICY</Text>
          </View>

          {PRIVACY_SECTIONS.map((section, idx) => (
            <View key={idx} style={styles.policyItem}>
              <Text style={[styles.policyTitle, { color: palette.textPrimary }]}>
                {section.title}
              </Text>
              <Text style={[styles.policyBody, { color: palette.textSecondary }]}>
                {section.body}
              </Text>
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

  banner: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    gap: 12,
  },
  bannerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(205,245,227,0.5)',
    marginTop: 1,
  },
  bannerTitle: { fontSize: 14, fontWeight: '700' },
  bannerBody: { fontSize: 12, fontWeight: '500', lineHeight: 18 },

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

  policyItem: { gap: 4 },
  policyTitle: { fontSize: 14, fontWeight: '700' },
  policyBody: { fontSize: 13, fontWeight: '500', lineHeight: 20 },

  footer: { alignItems: 'center', paddingVertical: 8 },
  footerText: { fontSize: 10, fontWeight: '500' },
});
