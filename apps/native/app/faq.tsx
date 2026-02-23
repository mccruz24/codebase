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

const SECTIONS = [
  {
    title: 'General & Privacy',
    icon: 'shield' as const,
    items: [
      {
        q: 'What is the purpose of this app?',
        a: 'Aesthetic Logbook is a privacy-first personal tracking tool. It is designed to help you document your wellness protocols, injections, and subjective aesthetic metrics so you can see trends over time.',
      },
      {
        q: 'Does this app provide medical advice?',
        a: 'No. This application is strictly a passive logbook. It does not offer medical diagnoses, dosage recommendations, or treatment plans. Always consult with a qualified healthcare professional regarding your health decisions.',
      },
      {
        q: 'Where is my data stored?',
        a: 'Your data is stored securely in the cloud via your personal account. Only you can access your data. We do not share or sell your personal information.',
      },
    ],
  },
  {
    title: 'Features & Usage',
    icon: 'heartbeat' as const,
    items: [
      {
        q: 'How do I log an injection?',
        a: "Tap the '+' button in the navigation bar or use the 'Log Dose' button on the dashboard. You can select your protocol, adjust the dose, date, and select an injection site.",
      },
      {
        q: "What is the 'Check-In' feature?",
        a: "The Check-In allows you to log subjective metrics like 'Muscle Fullness', 'Skin Clarity', and 'Energy' on a scale of 1-10, along with your body weight. This helps you correlate how you feel with your protocols.",
      },
      {
        q: 'How do I read the Trends chart?',
        a: 'Go to the Trends tab. Select a metric (like Weight or Energy) from the buttons at the top. The chart visualizes your entries over time to show progress.',
      },
    ],
  },
  {
    title: 'Protocols',
    icon: 'eyedropper' as const,
    items: [
      {
        q: 'How do I add a new protocol?',
        a: "Navigate to the Protocols tab and tap the '+' button in the top right. You can define the name, dose, unit, frequency, and color theme for that compound.",
      },
      {
        q: 'Can I edit an existing protocol?',
        a: 'Yes. Tap on any protocol card in the list to open the edit screen. You can change the schedule or archive the protocol if you are no longer using it.',
      },
    ],
  },
  {
    title: 'Troubleshooting',
    icon: 'question-circle' as const,
    items: [
      {
        q: "My schedule isn't showing up on the dashboard.",
        a: "Ensure you have set the correct 'Start Date' and 'Frequency' in your protocol settings. The dashboard only shows doses due today based on those settings.",
      },
      {
        q: 'How do I reset my data?',
        a: "Go to Settings > Data Control. Tap 'Reset All Data'. You will need to confirm this action as it cannot be undone.",
      },
    ],
  },
];

export default function FAQScreen() {
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
            <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Help Center</Text>
            <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}>SUPPORT & FAQ</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* FAQ Sections */}
        {SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.sectionWrap}>
            {/* Section label */}
            <View style={styles.sectionLabelRow}>
              <FontAwesome name={section.icon} size={14} color={palette.textMuted} />
              <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>
                {section.title.toUpperCase()}
              </Text>
            </View>

            {/* Cards */}
            <View
              style={[
                styles.sectionCard,
                { backgroundColor: palette.card, borderColor: palette.cardBorder },
              ]}
            >
              {section.items.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.qaItem,
                    i < section.items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: palette.cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.question, { color: palette.textPrimary }]}>{item.q}</Text>
                  <Text style={[styles.answer, { color: palette.textMuted }]}>{item.a}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: palette.textMuted }]}>Still have questions?</Text>
          <Text style={[styles.footerEmail, { color: palette.textPrimary }]}>
            Contact support at help@aestheticlog.com
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

  sectionWrap: { gap: 10 },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },

  sectionCard: {
    borderWidth: 1,
    borderRadius: 32,
    overflow: 'hidden',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
        }
      : {}),
  },

  qaItem: { padding: 24, gap: 6 },
  question: { fontSize: 14, fontWeight: '700' },
  answer: { fontSize: 12, fontWeight: '500', lineHeight: 18 },

  footer: { alignItems: 'center', gap: 4, paddingVertical: 8 },
  footerText: { fontSize: 12, fontWeight: '500' },
  footerEmail: { fontSize: 12, fontWeight: '700' },
});
