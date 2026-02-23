import React, { useEffect, useMemo, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
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
import { getResearchEntryById, type ResearchEntry } from '@/services/researchData';

export default function ResearchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = useMemo(() => getUiPalette(isDark), [isDark]);
  const insets = useSafeAreaInsets();

  const [entry, setEntry] = useState<ResearchEntry | null>(null);

  useEffect(() => {
    if (id) {
      const data = getResearchEntryById(id);
      if (data) {
        setEntry(data);
      } else {
        router.back();
      }
    }
  }, [id]);

  if (!entry) return null;

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
            <Text style={[styles.headerSubtitle, { color: palette.textMuted }]}>
              RESEARCH REFERENCE
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Entry title area */}
        <View style={styles.titleArea}>
          <View style={[styles.categoryBadge, { backgroundColor: palette.field }]}>
            <Text style={[styles.categoryBadgeText, { color: palette.textMuted }]}>
              {entry.category.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.entryName, { color: palette.textPrimary }]}>{entry.name}</Text>
          <View style={[styles.classificationBar, { borderLeftColor: palette.cardBorder }]}>
            <Text style={[styles.classificationText, { color: palette.textMuted }]}>
              {entry.classification}
            </Text>
          </View>
        </View>

        {/* Overview */}
        <SectionCard palette={palette} isDark={isDark}>
          <SectionHeader icon="info-circle" label="Overview" palette={palette} />
          <Text style={[styles.bodyText, { color: palette.textSecondary }]}>
            {entry.overview}
          </Text>
        </SectionCard>

        {/* Research Context */}
        <SectionCard palette={palette} isDark={isDark}>
          <SectionHeader icon="flask" label="Research Context" palette={palette} />
          <Text style={[styles.contextIntro, { color: palette.textMuted }]}>
            In research settings, this compound has been investigated in models involving:
          </Text>
          <View style={styles.bulletList}>
            {entry.researchContext.map((item, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: palette.textMuted }]} />
                <Text style={[styles.bulletText, { color: palette.textSecondary }]}>{item}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        {/* Mechanism */}
        <SectionCard palette={palette} isDark={isDark}>
          <SectionHeader icon="cogs" label="Mechanism of Interest" palette={palette} />
          <Text style={[styles.bodyText, { color: palette.textSecondary }]}>
            {entry.mechanism}
          </Text>
        </SectionCard>

        {/* Limitations — Warning Style */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDark ? '#1C1917' : '#FAFAF9',
              borderColor: isDark ? '#292524' : '#E7E5E4',
            },
          ]}
        >
          <SectionHeader icon="exclamation-triangle" label="Research Limitations" palette={palette} />
          <Text style={[styles.bodyText, { color: palette.textSecondary }]}>
            {entry.limitations}
          </Text>
        </View>

        {/* Regulatory Status */}
        <SectionCard palette={palette} isDark={isDark}>
          <SectionHeader icon="balance-scale" label="Regulatory Status" palette={palette} />
          <Text style={[styles.bodyText, { color: palette.textSecondary }]}>
            {entry.regulatoryStatus}
          </Text>
        </SectionCard>

        {/* References */}
        <View style={styles.referencesSection}>
          <View style={[styles.sectionHeaderRow, { opacity: 0.6 }]}>
            <FontAwesome name="book" size={14} color={palette.textMuted} />
            <Text style={[styles.sectionHeaderLabel, { color: palette.textMuted }]}>
              SELECTED REFERENCES
            </Text>
          </View>
          {entry.references.map((ref, idx) => (
            <View
              key={idx}
              style={[
                styles.referenceCard,
                { backgroundColor: palette.card, borderColor: palette.cardBorder },
              ]}
            >
              <Text style={[styles.referenceText, { color: palette.textMuted }]}>{ref}</Text>
            </View>
          ))}
        </View>

        {/* Footer disclaimer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: palette.textMuted }]}>
            This content is provided for educational reference only. The app does not provide
            medical advice or dosing guidance.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function SectionCard({
  children,
  palette,
  isDark,
}: {
  children: React.ReactNode;
  palette: ReturnType<typeof getUiPalette>;
  isDark: boolean;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
      {children}
    </View>
  );
}

function SectionHeader({
  icon,
  label,
  palette,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  palette: ReturnType<typeof getUiPalette>;
}) {
  return (
    <View style={styles.sectionHeaderRow}>
      <FontAwesome name={icon} size={14} color={palette.textMuted} />
      <Text style={[styles.sectionHeaderLabel, { color: palette.textPrimary }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: { gap: 16 },

  // Header
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
  headerSubtitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  headerSpacer: { width: 40 },

  // Title area
  titleArea: { gap: 8 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  entryName: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  classificationBar: { borderLeftWidth: 2, paddingLeft: 14 },
  classificationText: { fontSize: 13, fontWeight: '500', lineHeight: 20 },

  // Section card
  sectionCard: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 24,
    gap: 12,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
        }
      : {}),
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeaderLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },

  // Body text
  bodyText: { fontSize: 13, fontWeight: '500', lineHeight: 20 },

  // Research context
  contextIntro: { fontSize: 13, fontWeight: '500', fontStyle: 'italic', lineHeight: 20 },
  bulletList: { gap: 10 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bulletDot: { width: 5, height: 5, borderRadius: 3, marginTop: 7 },
  bulletText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 20 },

  // References
  referencesSection: { gap: 10 },
  referenceCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  referenceText: { fontSize: 11, fontWeight: '500', lineHeight: 17 },

  // Footer
  footer: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 },
  footerText: { fontSize: 10, fontWeight: '500', textAlign: 'center', lineHeight: 16 },
});
