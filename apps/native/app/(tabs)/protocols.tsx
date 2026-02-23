import React, { useCallback, useMemo, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useColorScheme } from '@/components/useColorScheme';
import { listCompounds, listInjectionLogs } from '@/services/repository';
import { UI_LAYOUT, getUiPalette } from '@/theme/ui';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import type { Compound, InjectionLog } from '@dosebase/shared';

type ViewMode = 'protocols' | 'history';

function getCategoryLabel(category: Compound['category']) {
  if (category === 'relaxant') return 'Relaxants';
  if (category === 'booster') return 'Skin Boosters';
  if (category === 'microneedling') return 'Micro Needling';
  return 'Peptides';
}

function getCategoryIcon(category: Compound['category']): React.ComponentProps<typeof FontAwesome>['name'] {
  if (category === 'relaxant') return 'magic';
  if (category === 'booster') return 'tint';
  if (category === 'microneedling') return 'th';
  return 'medkit';
}

// Maps compound color to solid hex for the icon background
function getCompoundSolidBg(color?: string): string {
  const lookup: Record<string, string> = {
    'bg-red-500': '#EF4444',
    'bg-rose-500': '#F43F5E',
    'bg-pink-500': '#EC4899',
    'bg-fuchsia-500': '#D946EF',
    'bg-purple-500': '#A855F7',
    'bg-indigo-500': '#6366F1',
    'bg-blue-500': '#3B82F6',
    'bg-sky-500': '#0EA5E9',
    'bg-teal-500': '#14B8A6',
    'bg-emerald-500': '#10B981',
  };
  return lookup[color ?? ''] ?? '#6366F1';
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatDateKey(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function ProtocolsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = getUiPalette(isDark);
  const tabBarHeight = useTabBarHeight();
  const [viewMode, setViewMode] = useState<ViewMode>('protocols');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [logs, setLogs] = useState<InjectionLog[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextCompounds, nextLogs] = await Promise.all([
        listCompounds({ includeArchived: true }),
        listInjectionLogs({ limit: 1000 }),
      ]);
      setCompounds(nextCompounds);
      setLogs(nextLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load protocols');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const activeCompounds = useMemo(() => compounds.filter((compound) => !compound.isArchived), [compounds]);
  const archivedCompounds = useMemo(() => compounds.filter((compound) => compound.isArchived), [compounds]);

  const groupedActive = useMemo(() => ({
    peptide: activeCompounds.filter((c) => c.category === 'peptide'),
    relaxant: activeCompounds.filter((c) => c.category === 'relaxant'),
    booster: activeCompounds.filter((c) => c.category === 'booster'),
    microneedling: activeCompounds.filter((c) => c.category === 'microneedling'),
  }), [activeCompounds]);

  // Group logs by date label
  const groupedLogs = useMemo(() => {
    const grouped: Record<string, InjectionLog[]> = {};
    for (const log of logs) {
      const key = formatDateKey(log.timestamp);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(log);
    }
    return grouped;
  }, [logs]);

  const compoundById = useMemo(
    () => new Map(compounds.map((c) => [c.id, c])),
    [compounds]
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={palette.textSecondary} />
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.centerWrap}>
          <Text style={[styles.errorTitle, { color: palette.textPrimary }]}>Protocols unavailable</Text>
          <Text style={[styles.errorText, { color: palette.textMuted }]}>{error}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: UI_LAYOUT.tabPageTopPadding, paddingBottom: tabBarHeight },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ gap: 3 }}>
            <Text style={[styles.title, { color: palette.textPrimary }]}>Your Protocols</Text>
            <Text style={[styles.subtitle, { color: palette.textMuted }]}>Manage your stack</Text>
          </View>
          {viewMode === 'protocols' ? (
            <Pressable
              style={[styles.addButton, Platform.OS === 'ios' && {
                shadowColor: '#1C1917',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.16,
                shadowRadius: 12,
              }]}
              onPress={() => router.push('/compound-form')}
            >
              <FontAwesome name="plus" size={17} color={isDark ? '#0C0A09' : '#FFFFFF'} />
            </Pressable>
          ) : null}
        </View>

        {/* View Toggle */}
        <View style={[styles.segmentWrap, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#FAFAF9' }]}>
          <Pressable
            onPress={() => setViewMode('protocols')}
            style={[
              styles.segmentButton,
              viewMode === 'protocols' ? styles.segmentButtonActive : null,
            ]}
          >
            <FontAwesome
              name="medkit"
              size={13}
              color={viewMode === 'protocols' ? '#FFFFFF' : palette.textMuted}
            />
            <Text style={[styles.segmentText, { color: viewMode === 'protocols' ? '#FFFFFF' : palette.textMuted }]}>
              Protocols
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode('history')}
            style={[styles.segmentButton, viewMode === 'history' ? styles.segmentButtonActive : null]}
          >
            <FontAwesome
              name="history"
              size={13}
              color={viewMode === 'history' ? '#FFFFFF' : palette.textMuted}
            />
            <Text style={[styles.segmentText, { color: viewMode === 'history' ? '#FFFFFF' : palette.textMuted }]}>
              Log History
            </Text>
          </Pressable>
        </View>

        {viewMode === 'protocols' ? (
          <View style={styles.contentStack}>
            {activeCompounds.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#FAFAF9' }]}>
                <View style={[styles.emptyIcon, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}>
                  <FontAwesome name="medkit" size={22} color={palette.textMuted} />
                </View>
                <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>No Active Protocols</Text>
                <Text style={[styles.emptyBody, { color: palette.textMuted }]}>
                  Create your first protocol to start scheduling doses.
                </Text>
              </View>
            ) : null}

            {(Object.keys(groupedActive) as Array<keyof typeof groupedActive>).map((categoryKey, categoryIndex) => {
              const compoundsInCategory = groupedActive[categoryKey];
              if (compoundsInCategory.length === 0) return null;
              return (
                <View key={categoryKey}>
                  {/* Section divider (except first with content) */}
                  {categoryIndex > 0 && (
                    <View style={[styles.divider, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]} />
                  )}
                  {/* Section header */}
                  <View style={styles.sectionTitleRow}>
                    <FontAwesome name={getCategoryIcon(categoryKey)} size={12} color={palette.textMuted} />
                    <Text style={[styles.sectionTitle, { color: palette.textMuted }]}>
                      {getCategoryLabel(categoryKey)}
                    </Text>
                  </View>
                  <View style={styles.cardsStack}>
                    {compoundsInCategory.map((compound) => (
                      <Pressable
                        key={compound.id}
                        onPress={() => router.push({ pathname: '/compound-form', params: { id: compound.id } })}
                        style={[styles.protocolCard, {
                          backgroundColor: palette.card,
                          borderColor: isDark ? '#292524' : '#FAFAF9',
                        }]}
                      >
                        {/* Background decoration circle */}
                        <View style={[styles.cardBgDecoration, { backgroundColor: `${getCompoundSolidBg(compound.color)}18` }]} />
                        <View style={styles.cardLeft}>
                          {/* Colored icon square */}
                          <View style={[styles.cardIconWrap, { backgroundColor: getCompoundSolidBg(compound.color) }]}>
                            <FontAwesome name={getCategoryIcon(compound.category)} size={16} color="#FFFFFF" />
                          </View>
                          <View style={styles.cardTextWrap}>
                            <Text style={[styles.cardTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                              {compound.name}
                            </Text>
                            <View style={styles.metaRow}>
                              <View style={[styles.doseBadge, { backgroundColor: isDark ? '#292524' : '#F5F5F4', borderColor: isDark ? '#3A3734' : '#E7E5E4' }]}>
                                <Text style={[styles.doseBadgeText, { color: palette.textSecondary }]}>
                                  {compound.doseAmount ?? '--'} {compound.doseUnit}
                                </Text>
                              </View>
                              <Text style={[styles.metaText, { color: palette.textMuted }]}>
                                {getCategoryLabel(compound.category)}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={[styles.chevronWrap, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}>
                          <FontAwesome name="chevron-right" size={11} color={palette.textMuted} />
                        </View>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}

            {/* Archived section */}
            {archivedCompounds.length > 0 ? (
              <View>
                <View style={[styles.divider, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]} />
                <View style={styles.sectionTitleRow}>
                  <FontAwesome name="archive" size={12} color={palette.textMuted} />
                  <Text style={[styles.sectionTitle, { color: palette.textMuted }]}>Archived</Text>
                </View>
                <View style={styles.cardsStack}>
                  {archivedCompounds.map((compound) => (
                    <Pressable
                      key={compound.id}
                      onPress={() => router.push({ pathname: '/compound-form', params: { id: compound.id } })}
                      style={[styles.protocolCard, {
                        backgroundColor: isDark ? '#1E1D1B' : '#F5F4F2',
                        borderColor: isDark ? '#292524' : '#E7E5E4',
                        opacity: 0.65,
                      }]}
                    >
                      <View style={styles.cardLeft}>
                        <View style={[styles.cardIconWrap, { backgroundColor: isDark ? '#292524' : '#E2E8F0' }]}>
                          <FontAwesome name={getCategoryIcon(compound.category)} size={16} color={palette.textMuted} />
                        </View>
                        <View style={styles.cardTextWrap}>
                          <Text style={[styles.cardTitle, { color: palette.textMuted, textDecorationLine: 'line-through' }]} numberOfLines={1}>
                            {compound.name}
                          </Text>
                          <View style={styles.metaRow}>
                            <View style={[styles.doseBadge, { backgroundColor: isDark ? '#292524' : '#E7E5E4', borderColor: 'transparent' }]}>
                              <Text style={[styles.doseBadgeText, { color: palette.textMuted }]}>Archived</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          /* Log History View */
          <View style={styles.contentStack}>
            {logs.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#FAFAF9' }]}>
                <View style={[styles.emptyIcon, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}>
                  <FontAwesome name="history" size={22} color={palette.textMuted} />
                </View>
                <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>No logs yet</Text>
                <Text style={[styles.emptyBody, { color: palette.textMuted }]}>
                  Once you add logs, they'll appear grouped by date here.
                </Text>
              </View>
            ) : (
              Object.entries(groupedLogs).map(([dateLabel, dateLogs]) => (
                <View key={dateLabel}>
                  {/* Sticky date header */}
                  <View style={styles.dateHeaderRow}>
                    <FontAwesome name="clock-o" size={11} color={palette.textMuted} />
                    <Text style={[styles.dateHeaderText, { color: palette.textMuted }]}>{dateLabel}</Text>
                  </View>
                  <View style={styles.cardsStack}>
                    {dateLogs.map((log) => {
                      const compound = compoundById.get(log.compoundId);
                      return (
                        <Pressable
                          key={log.id}
                          onPress={() => router.push({ pathname: '/(tabs)/log', params: { logId: log.id } })}
                          style={[styles.logCard, {
                            backgroundColor: palette.card,
                            borderColor: isDark ? '#292524' : '#FAFAF9',
                          }]}
                        >
                          <View style={[styles.logIconWrap, { backgroundColor: compound ? `${getCompoundSolidBg(compound.color)}22` : isDark ? '#292524' : '#F5F5F4' }]}>
                            <FontAwesome
                              name={compound ? getCategoryIcon(compound.category) : 'check'}
                              size={14}
                              color={compound ? getCompoundSolidBg(compound.color) : palette.textMuted}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.cardTitle, { color: palette.textPrimary }]} numberOfLines={1}>
                              {compound?.name ?? 'Unknown compound'}
                            </Text>
                            <Text style={[styles.logMeta, { color: palette.textMuted }]}>
                              {log.dose} {compound?.doseUnit ?? ''}
                              {log.site ? ` · ${log.site}` : ''}
                            </Text>
                          </View>
                          {/* Time badge */}
                          <View style={[styles.timeBadge, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}>
                            <FontAwesome name="clock-o" size={10} color={palette.textMuted} />
                            <Text style={[styles.timeText, { color: palette.textMuted }]}>
                              {formatTime(log.timestamp)}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { gap: UI_LAYOUT.sectionGap },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  errorTitle: { fontSize: 18, fontWeight: '800' },
  errorText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 14, fontWeight: '500' },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#1C1917',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Segment toggle
  segmentWrap: {
    borderWidth: 1,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 6,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#1C1917',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#1C1917', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 }
      : {}),
  },
  segmentText: { fontSize: 12, fontWeight: '800' },

  // Content
  contentStack: { gap: 0 },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 32,
    gap: 10,
    alignItems: 'center',
  },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptyBody: { fontSize: 13, fontWeight: '500', lineHeight: 19, textAlign: 'center' },

  // Section headers
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, paddingHorizontal: 2, marginTop: 20 },
  sectionTitle: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.1 },
  divider: { height: 1, width: '100%', marginTop: 8 },

  // Protocol cards
  cardsStack: { gap: 12, marginBottom: 4 },
  protocolCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 14 }
      : {}),
  },
  cardBgDecoration: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }
      : {}),
  },
  cardTextWrap: { flexShrink: 1, gap: 6 },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  doseBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  doseBadgeText: { fontSize: 11, fontWeight: '700' },
  metaText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  chevronWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  // History / log cards
  dateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  dateHeaderText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  logCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 10 }
      : {}),
  },
  logIconWrap: { width: 40, height: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  logMeta: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  timeText: { fontSize: 11, fontWeight: '700' },
});
