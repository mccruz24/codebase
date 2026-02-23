import React, { useEffect, useMemo, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/Screen';
import { useColorScheme } from '@/components/useColorScheme';
import { UI_LAYOUT, getUiPalette } from '@/theme/ui';
import { getResearchEntries, CATEGORIES, type ResearchEntry } from '@/services/researchData';

export default function ResearchScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = useMemo(() => getUiPalette(isDark), [isDark]);
  const insets = useSafeAreaInsets();

  const [entries, setEntries] = useState<ResearchEntry[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  useEffect(() => {
    setEntries(getResearchEntries());
  }, []);

  const filtered = useMemo(() => {
    let result = entries;
    if (category !== 'All') {
      result = result.filter((e) => e.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) => e.name.toLowerCase().includes(q) || e.classification.toLowerCase().includes(q)
      );
    }
    return result;
  }, [entries, search, category]);

  // ── Disclaimer gate ──
  if (!disclaimerAccepted) {
    return (
      <Screen>
        <View style={[styles.disclaimerWrap, { paddingBottom: insets.bottom + 24 }]}>
          <View style={[styles.disclaimerCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
            <View style={[styles.disclaimerIcon, { backgroundColor: palette.field }]}>
              <FontAwesome name="graduation-cap" size={28} color={palette.textSecondary} />
            </View>

            <Text style={[styles.disclaimerTitle, { color: palette.textPrimary }]}>Research Vault</Text>
            <Text style={[styles.disclaimerSub, { color: palette.textMuted }]}>
              EDUCATIONAL REFERENCE ONLY
            </Text>

            <View style={[styles.disclaimerBox, { backgroundColor: palette.field, borderColor: palette.cardBorder }]}>
              <DisclaimerBullet
                text="This section provides summaries of publicly available scientific literature for educational and research reference purposes only."
                palette={palette}
              />
              <DisclaimerBullet
                text="The information presented does not constitute medical advice, diagnosis, or treatment recommendations."
                palette={palette}
              />
              <DisclaimerBullet
                text="This app does not provide dosing guidance, protocol recommendations, or clinical interpretation."
                palette={palette}
              />
            </View>

            <Pressable
              onPress={() => setDisclaimerAccepted(true)}
              style={[styles.enterBtn, { backgroundColor: isDark ? '#FAFAF9' : '#1C1917' }]}
            >
              <Text style={[styles.enterBtnText, { color: isDark ? '#1C1917' : '#FFFFFF' }]}>
                Enter Research Section
              </Text>
            </Pressable>

            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={[styles.backBtnText, { color: palette.textMuted }]}>Go Back</Text>
            </Pressable>
          </View>
        </View>
      </Screen>
    );
  }

  // ── Main list ──
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
            style={[styles.navButton, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' }]}
          >
            <FontAwesome name="chevron-left" size={14} color={palette.textMuted} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Research Vault</Text>
            <Text style={[styles.headerSub, { color: palette.textMuted }]}>Educational Reference</Text>
          </View>
          <View style={[styles.headerIcon, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
            <FontAwesome name="book" size={16} color={palette.textMuted} />
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchWrap, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
          <FontAwesome name="search" size={16} color={palette.textMuted} style={{ marginLeft: 4 }} />
          <TextInput
            placeholder="Search compounds..."
            placeholderTextColor={palette.textMuted}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: palette.textPrimary }]}
          />
        </View>

        {/* Category filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.catChip,
                category === cat
                  ? [styles.catChipActive, { backgroundColor: isDark ? '#FAFAF9' : '#1C1917' }]
                  : { backgroundColor: palette.card, borderColor: palette.cardBorder, borderWidth: 1 },
              ]}
            >
              <Text
                style={[
                  styles.catChipText,
                  { color: category === cat ? (isDark ? '#1C1917' : '#FFFFFF') : palette.textMuted },
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* List */}
        {filtered.map((entry) => (
          <Pressable
            key={entry.id}
            onPress={() => router.push({ pathname: '/research-detail', params: { id: entry.id } })}
            style={[styles.entryCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}
          >
            <View style={styles.entryHeader}>
              <View style={[styles.categoryBadge, { backgroundColor: palette.field }]}>
                <Text style={[styles.categoryBadgeText, { color: palette.textMuted }]}>
                  {entry.category.toUpperCase()}
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={12} color={palette.textMuted} />
            </View>
            <Text style={[styles.entryName, { color: palette.textPrimary }]}>{entry.name}</Text>
            <Text style={[styles.entryClassification, { color: palette.textMuted }]} numberOfLines={2}>
              {entry.classification}
            </Text>
          </Pressable>
        ))}

        {filtered.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: palette.textMuted }]}>No entries found.</Text>
          </View>
        )}

        {/* Footer disclaimer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: palette.textMuted }]}>
            This content is provided for educational reference only. The app does not provide medical
            advice, dosing guidance, or protocol recommendations.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

function DisclaimerBullet({ text, palette }: { text: string; palette: ReturnType<typeof getUiPalette> }) {
  return (
    <View style={styles.bulletRow}>
      <FontAwesome name="exclamation-triangle" size={14} color={palette.textMuted} style={{ marginTop: 2 }} />
      <Text style={[styles.bulletText, { color: palette.textSecondary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { gap: 16 },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  navButton: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSub: { fontSize: 13, fontWeight: '500' },
  headerIcon: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 48,
    ...(Platform.OS === 'ios' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 } : {}),
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '500' },

  // Categories
  catRow: { gap: 8, paddingVertical: 4 },
  catChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 16 },
  catChipActive: {
    ...(Platform.OS === 'ios' ? { shadowColor: '#1C1917', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 } : {}),
  },
  catChipText: { fontSize: 12, fontWeight: '700' },

  // Entry card
  entryCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 24,
    gap: 8,
    ...(Platform.OS === 'ios' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 } : {}),
  },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  entryName: { fontSize: 20, fontWeight: '800' },
  entryClassification: { fontSize: 13, fontWeight: '500', lineHeight: 18 },

  // Empty
  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, fontWeight: '700' },

  // Footer
  footer: { alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 },
  footerText: { fontSize: 10, fontWeight: '500', textAlign: 'center', lineHeight: 16 },

  // Disclaimer gate
  disclaimerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  disclaimerCard: { borderWidth: 1, borderRadius: 40, padding: 32, width: '100%', alignItems: 'center', ...(Platform.OS === 'ios' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 24 } : {}) },
  disclaimerIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  disclaimerTitle: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  disclaimerSub: { fontSize: 12, fontWeight: '700', letterSpacing: 2, marginBottom: 24 },
  disclaimerBox: { borderWidth: 1, borderRadius: 24, padding: 20, gap: 14, width: '100%', marginBottom: 24 },
  bulletRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bulletText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 19 },
  enterBtn: { width: '100%', height: 52, borderRadius: 24, alignItems: 'center', justifyContent: 'center', ...(Platform.OS === 'ios' ? { shadowColor: '#1C1917', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 16 } : {}) },
  enterBtnText: { fontSize: 15, fontWeight: '700' },
  backBtn: { paddingVertical: 12 },
  backBtnText: { fontSize: 13, fontWeight: '700' },
});
