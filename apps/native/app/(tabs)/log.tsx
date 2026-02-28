import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AnimatedCard } from '@/components/motion/AnimatedCard';
import { AnimatedPressable } from '@/components/motion/AnimatedPressable';
import { Screen } from '@/components/Screen';
import { useColorScheme } from '@/components/useColorScheme';
import {
  deleteInjectionLog,
  getInjectionLogById,
  getLatestInjectionForCompound,
  insertInjectionLog,
  listCompounds,
  updateInjectionLog,
} from '@/services/repository';
import { haptics } from '@/services/haptics';
import { UI_LAYOUT, getUiPalette } from '@/theme/ui';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import type { Compound, InjectionLog } from '@dosebase/shared';

// ── Helpers ──────────────────────────────────────────────────────────────────

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function roundToStep(value: number, step: number) {
  const inv = 1 / step;
  return Math.round(value * inv) / inv;
}

function getDoseStep(doseUnit?: string): number {
  const u = (doseUnit ?? '').toLowerCase();
  if (u === 'mcg') return 50;
  if (u === 'mg') return 1;
  if (u === 'iu') return 1;
  if (u === 'ml') return 0.1;
  return 1;
}

function buildDosePresets(doseUnit?: string, base?: number, last?: number): number[] {
  const u = (doseUnit ?? '').toLowerCase();
  const defaults =
    u === 'mcg'
      ? [100, 250, 500, 750, 1000]
      : u === 'mg'
      ? [2.5, 5, 10, 20, 50]
      : u === 'iu'
      ? [5, 10, 20, 30, 50, 100]
      : u === 'ml'
      ? [0.5, 1, 2, 2.5]
      : [];

  const aroundBase =
    base && base > 0
      ? [base * 0.5, base, base * 1.5, base * 2].map((n) =>
          u === 'ml' ? roundToStep(n, 0.1) : u === 'mg' ? roundToStep(n, 0.5) : Math.round(n)
        )
      : [];

  const raw = [
    ...(last && last > 0 ? [last] : []),
    ...(base && base > 0 ? [base] : []),
    ...aroundBase,
    ...defaults,
  ];

  return Array.from(new Set(raw))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, 8);
}

function getCompoundAccent(color?: string): string {
  const lookup: Record<string, string> = {
    'bg-red-500': '#FEE2E2',
    'bg-rose-500': '#FFE4E6',
    'bg-pink-500': '#FCE7F3',
    'bg-fuchsia-500': '#FAE8FF',
    'bg-purple-500': '#F3E8FF',
    'bg-indigo-500': '#E0E7FF',
    'bg-blue-500': '#DBEAFE',
    'bg-sky-500': '#E0F2FE',
    'bg-teal-500': '#CCFBF1',
    'bg-emerald-500': '#D1FAE5',
  };
  return lookup[color ?? ''] ?? '#F3E8FF';
}

function getCompoundSolidColor(color?: string): string {
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

function getCategoryIcon(category?: string): React.ComponentProps<typeof FontAwesome>['name'] {
  if (category === 'relaxant') return 'magic';
  if (category === 'booster') return 'tint';
  if (category === 'microneedling') return 'th';
  return 'medkit';
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Compound Selector Screen ─────────────────────────────────────────────────

function CompoundSelectScreen({
  compounds,
  onSelect,
  onClose,
  isDark,
  palette,
}: {
  compounds: Compound[];
  onSelect: (id: string) => void;
  onClose: () => void;
  isDark: boolean;
  palette: ReturnType<typeof getUiPalette>;
}) {
  return (
    <View style={[styles.selectScreen, { backgroundColor: palette.background }]}>
      <View style={styles.selectHeader}>
        <AnimatedPressable
          onPress={() => {
            haptics.selection();
            onClose();
          }}
          style={[styles.closeButton, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' }]}
        >
          <FontAwesome name="times" size={18} color={palette.textMuted} />
        </AnimatedPressable>
      </View>

      <View style={styles.selectTitleWrap}>
        <Text style={[styles.selectTitle, { color: palette.textPrimary }]}>Log Protocol</Text>
        <Text style={[styles.selectSubtitle, { color: palette.textMuted }]}>
          What did you administer today?
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.selectList}>
        {compounds.length === 0 ? (
          <View style={styles.selectEmpty}>
            <Text style={[styles.selectEmptyText, { color: palette.textMuted }]}>
              No protocols found.
            </Text>
            <AnimatedPressable
              style={[styles.addFirstButton, { backgroundColor: '#1C1917' }]}
              onPress={() => {
                haptics.selection();
                onClose();
                router.push('/compound-form');
              }}
            >
              <Text style={styles.addFirstButtonText}>Add Your First Protocol</Text>
            </AnimatedPressable>
          </View>
        ) : (
          compounds.map((c) => {
            const solid = getCompoundSolidColor(c.color);
            const accent = getCompoundAccent(c.color);
            return (
              <AnimatedPressable
                key={c.id}
                onPress={() => {
                  haptics.selection();
                  onSelect(c.id);
                }}
                style={[
                  styles.selectCard,
                  {
                    backgroundColor: palette.card,
                    borderColor: isDark ? '#292524' : '#FAFAF9',
                  },
                ]}
              >
                <View style={[styles.selectCardIcon, { backgroundColor: solid }]}>
                  <FontAwesome name={getCategoryIcon(c.category)} size={20} color="#FFFFFF" />
                </View>
                <View style={styles.selectCardText}>
                  <Text style={[styles.selectCardName, { color: palette.textPrimary }]}>{c.name}</Text>
                  <View style={styles.selectCardMeta}>
                    {c.category !== 'microneedling' && c.doseAmount != null && (
                      <View style={[styles.doseBadge, { backgroundColor: isDark ? '#292524' : '#F5F5F4', borderColor: isDark ? '#3A3734' : '#E7E5E4' }]}>
                        <Text style={[styles.doseBadgeText, { color: palette.textSecondary }]}>
                          {c.doseAmount} {c.doseUnit}
                        </Text>
                      </View>
                    )}
                    {c.targetArea && c.targetArea.length > 0 && (
                      <Text style={[styles.selectCardArea, { color: palette.textMuted }]}>
                        {c.targetArea[0]}{c.targetArea.length > 1 ? ` +${c.targetArea.length - 1}` : ''}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={[styles.selectChevron, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}>
                  <FontAwesome name="chevron-right" size={12} color={palette.textMuted} />
                </View>
              </AnimatedPressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function LogScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = getUiPalette(isDark);
  const tabBarHeight = useTabBarHeight();
  const params = useLocalSearchParams<{ compoundId?: string; logId?: string }>();

  const [loading, setLoading] = useState(true);
  const [busy, setSaving] = useState(false);
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSelect, setShowSelect] = useState(false);

  // Form state
  const [selectedCompoundId, setSelectedCompoundId] = useState<string>('');
  const [dose, setDose] = useState<string>('');
  const [needleDepth, setNeedleDepth] = useState<string>('');
  const [glideSerum, setGlideSerum] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString());
  const [lastDose, setLastDose] = useState<number | null>(null);
  const [editLogId, setEditLogId] = useState<string | null>(null);

  const isEdit = Boolean(editLogId);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allCompounds = await listCompounds({ includeArchived: false });
      setCompounds(allCompounds);

      if (params.logId) {
        // Edit mode: load existing log
        const existing = await getInjectionLogById(params.logId);
        setEditLogId(params.logId);
        setSelectedCompoundId(existing.compoundId);
        setTimestamp(existing.timestamp);
        setDose(existing.dose?.toString() ?? '');
        setNeedleDepth(existing.needleDepth?.toString() ?? '');
        setGlideSerum(existing.glideSerum ?? '');
        setLastDose(existing.dose ?? null);
      } else if (params.compoundId) {
        // Pre-selected compound
        setSelectedCompoundId(params.compoundId);
        const last = await getLatestInjectionForCompound(params.compoundId);
        if (last) {
          setDose(last.dose?.toString() ?? '');
          setLastDose(last.dose ?? null);
          setNeedleDepth(last.needleDepth?.toString() ?? '');
          setGlideSerum(last.glideSerum ?? '');
        } else {
          const comp = allCompounds.find((c) => c.id === params.compoundId);
          if (comp?.doseAmount) setDose(comp.doseAmount.toString());
        }
      } else if (allCompounds.length > 0) {
        // Default to first compound
        const firstId = allCompounds[0].id;
        setSelectedCompoundId(firstId);
        const last = await getLatestInjectionForCompound(firstId);
        if (last) {
          setDose(last.dose?.toString() ?? '');
          setLastDose(last.dose ?? null);
        } else {
          const comp = allCompounds[0];
          if (comp?.doseAmount) setDose(comp.doseAmount.toString());
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [params.logId, params.compoundId]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const handleSelectCompound = useCallback(
    async (id: string) => {
      haptics.selection();
      setShowSelect(false);
      setSelectedCompoundId(id);
      setDose('');
      setNeedleDepth('');
      setGlideSerum('');
      setLastDose(null);
      try {
        const last = await getLatestInjectionForCompound(id);
        if (last) {
          setDose(last.dose?.toString() ?? '');
          setLastDose(last.dose ?? null);
          setNeedleDepth(last.needleDepth?.toString() ?? '');
          setGlideSerum(last.glideSerum ?? '');
        } else {
          const comp = compounds.find((c) => c.id === id);
          if (comp?.doseAmount) setDose(comp.doseAmount.toString());
        }
      } catch {
        // ignore
      }
    },
    [compounds]
  );

  const selectedCompound = useMemo(
    () => compounds.find((c) => c.id === selectedCompoundId) ?? null,
    [compounds, selectedCompoundId]
  );

  const doseStep = getDoseStep(selectedCompound?.doseUnit);
  const dosePresets = buildDosePresets(
    selectedCompound?.doseUnit,
    selectedCompound?.doseAmount,
    lastDose ?? undefined
  );

  const accentColor = getCompoundAccent(selectedCompound?.color);
  const solidColor = getCompoundSolidColor(selectedCompound?.color);

  const handleSubmit = useCallback(async () => {
    if (!selectedCompoundId) return;
    if (selectedCompound?.category !== 'microneedling' && !dose) {
      haptics.error();
      Alert.alert('Missing dose', 'Please enter a dose amount.');
      return;
    }
    const derivedSite =
      selectedCompound?.targetArea && selectedCompound.targetArea.length > 0
        ? selectedCompound.targetArea.join(', ')
        : undefined;

    setSaving(true);
    try {
      const payload = {
        compoundId: selectedCompoundId,
        timestamp,
        dose: dose ? parseFloat(dose) : 0,
        site: derivedSite,
        needleDepth: needleDepth ? parseFloat(needleDepth) : undefined,
        glideSerum: glideSerum || undefined,
      };
      if (isEdit && editLogId) {
        await updateInjectionLog(editLogId, payload);
      } else {
        await insertInjectionLog(payload);
      }
      haptics.success();
      router.replace('/(tabs)/log');
    } catch (err) {
      haptics.error();
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  }, [selectedCompoundId, selectedCompound, dose, timestamp, needleDepth, glideSerum, isEdit, editLogId]);

  const handleDelete = useCallback(() => {
    if (!editLogId) return;
    haptics.selection();
    Alert.alert(
      'Delete log entry',
      'This action cannot be undone. Are you sure you want to delete this log entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            haptics.destructive();
            setSaving(true);
            try {
              await deleteInjectionLog(editLogId);
              haptics.success();
              router.replace('/(tabs)/log');
            } catch (err) {
              haptics.error();
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete entry');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  }, [editLogId]);

  // ── Compound select overlay ───────────────────────────────────────────────
  if (!loading && showSelect) {
    return (
      <CompoundSelectScreen
        compounds={compounds}
        onSelect={(id) => void handleSelectCompound(id)}
        onClose={() => setShowSelect(false)}
        isDark={isDark}
        palette={palette}
      />
    );
  }

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
          <Text style={[styles.errorTitle, { color: palette.textPrimary }]}>Logging unavailable</Text>
          <Text style={[styles.errorBody, { color: palette.textMuted }]}>{error}</Text>
        </View>
      </Screen>
    );
  }

  // ── Logging form ──────────────────────────────────────────────────────────
  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ gap: 4 }}>
            <Text style={[styles.title, { color: palette.textPrimary }]}>
              {isEdit ? 'Edit Log' : 'Log Protocol'}
            </Text>
            <Text style={[styles.subtitle, { color: palette.textMuted }]}>
              {isEdit ? 'Update an existing entry' : 'What did you administer today?'}
            </Text>
          </View>
          {isEdit && (
            <AnimatedPressable
              onPress={handleDelete}
              style={[styles.deleteButton, { backgroundColor: isDark ? '#292524' : '#FEE2E2', borderColor: isDark ? '#3A3734' : '#FECACA' }]}
            >
              <FontAwesome name="trash-o" size={16} color="#EF4444" />
            </AnimatedPressable>
          )}
        </View>

        {compounds.length === 0 ? (
          <AnimatedCard style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#FAFAF9' }]}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}>
              <FontAwesome name="medkit" size={22} color={palette.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>No protocols found</Text>
            <Text style={[styles.emptyBody, { color: palette.textMuted }]}>
              Add your first protocol before logging doses.
            </Text>
            <AnimatedPressable
              style={[styles.goToProtocols, { backgroundColor: '#1C1917' }]}
              onPress={() => {
                haptics.selection();
                router.push('/compound-form');
              }}
            >
              <Text style={styles.goToProtocolsText}>Add Your First Protocol</Text>
            </AnimatedPressable>
          </AnimatedCard>
        ) : (
          <>
            {/* Main card */}
            <AnimatedCard
              style={[
                styles.mainCard,
                { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#FAFAF9' },
              ]}
            >
              {/* Accent blob from compound color */}
              <View style={[styles.cardBlob, { backgroundColor: accentColor }]} />

              {/* Compound selector */}
              <AnimatedPressable
                onPress={() => {
                  if (isEdit) return;
                  haptics.selection();
                  setShowSelect(true);
                }}
                style={[
                  styles.compoundSelector,
                  { backgroundColor: isDark ? '#292524' : '#F8F8F8', borderColor: isDark ? '#3A3734' : '#E7E5E4' },
                ]}
              >
                <View style={[styles.compoundDot, { backgroundColor: accentColor }]}>
                  <FontAwesome
                    name={getCategoryIcon(selectedCompound?.category)}
                    size={14}
                    color={solidColor}
                  />
                </View>
                <Text style={[styles.compoundName, { color: palette.textPrimary }]} numberOfLines={1}>
                  {selectedCompound?.name ?? 'Select protocol'}
                </Text>
                {!isEdit && (
                  <FontAwesome name="chevron-down" size={12} color={palette.textMuted} />
                )}
              </AnimatedPressable>

              {/* ── MICRONEEDLING: needle depth + glide serum ── */}
              {selectedCompound?.category === 'microneedling' ? (
                <View style={styles.inputSection}>
                  <Text style={[styles.microLabel, { color: palette.textMuted }]}>NEEDLE DEPTH (MM)</Text>

                  {/* Stepper */}
                  <View style={styles.stepperRow}>
                    <AnimatedPressable
                      style={[styles.stepperButton, { backgroundColor: isDark ? '#292524' : '#F5F5F4', borderColor: isDark ? '#3A3734' : '#E7E5E4' }]}
                      onPress={() => {
                        haptics.selection();
                        const next = roundToStep((parseFloat(needleDepth || '0') || 0) - 0.1, 0.1);
                        setNeedleDepth(String(clamp(next, 0, 3)));
                      }}
                    >
                      <FontAwesome name="minus" size={16} color={palette.textMuted} />
                    </AnimatedPressable>
                    <TextInput
                      style={[styles.doseInput, { color: palette.textPrimary }]}
                      value={needleDepth}
                      onChangeText={setNeedleDepth}
                      keyboardType="decimal-pad"
                      placeholder="0.0"
                      placeholderTextColor={palette.textMuted}
                    />
                    <AnimatedPressable
                      style={[styles.stepperButton, { backgroundColor: isDark ? '#292524' : '#F5F5F4', borderColor: isDark ? '#3A3734' : '#E7E5E4' }]}
                      onPress={() => {
                        haptics.selection();
                        const next = roundToStep((parseFloat(needleDepth || '0') || 0) + 0.1, 0.1);
                        setNeedleDepth(String(clamp(next, 0, 3)));
                      }}
                    >
                      <FontAwesome name="plus" size={16} color={palette.textMuted} />
                    </AnimatedPressable>
                  </View>

                  {/* Depth presets */}
                  <View style={styles.presetsRow}>
                    {[0.25, 0.5, 0.75, 1.0, 1.5, 2.0].map((v) => {
                      const selected = needleDepth === String(v);
                      return (
                        <AnimatedPressable
                          key={v}
                          onPress={() => {
                            haptics.selection();
                            setNeedleDepth(String(v));
                          }}
                          style={[
                            styles.presetChip,
                            selected
                              ? { backgroundColor: '#1C1917', borderColor: '#1C1917' }
                              : { backgroundColor: isDark ? '#292524' : '#F5F5F4', borderColor: isDark ? '#3A3734' : '#E7E5E4' },
                          ]}
                        >
                          <Text style={[styles.presetText, { color: selected ? '#FFFFFF' : palette.textSecondary }]}>
                            {v}mm
                          </Text>
                        </AnimatedPressable>
                      );
                    })}
                  </View>

                  {/* Glide serum */}
                  <Text style={[styles.microLabel, { color: palette.textMuted, marginTop: 16 }]}>GLIDE SERUM</Text>
                  <View style={[styles.glideInput, { backgroundColor: isDark ? '#292524' : '#F5F5F4', borderColor: isDark ? '#3A3734' : '#E7E5E4' }]}>
                    <TextInput
                      style={[styles.glideTextInput, { color: palette.textPrimary }]}
                      value={glideSerum}
                      onChangeText={setGlideSerum}
                      placeholder="e.g. Hyaluronic Acid"
                      placeholderTextColor={palette.textMuted}
                    />
                  </View>
                </View>
              ) : (
                /* ── STANDARD: dose input ── */
                <View style={styles.inputSection}>
                  <Text style={[styles.microLabel, { color: palette.textMuted }]}>DOSE AMOUNT</Text>

                  {/* Presets */}
                  {dosePresets.length > 0 && (
                    <View style={styles.presetsRow}>
                      {dosePresets.map((p) => {
                        const selected = dose === String(p);
                        return (
                          <AnimatedPressable
                            key={p}
                            onPress={() => {
                              haptics.selection();
                              setDose(String(p));
                            }}
                            style={[
                              styles.presetChip,
                              selected
                                ? { backgroundColor: '#1C1917', borderColor: '#1C1917' }
                                : { backgroundColor: isDark ? '#292524' : '#F5F5F4', borderColor: isDark ? '#3A3734' : '#E7E5E4' },
                            ]}
                          >
                            <Text style={[styles.presetText, { color: selected ? '#FFFFFF' : palette.textSecondary }]}>
                              {p} {selectedCompound?.doseUnit}
                            </Text>
                          </AnimatedPressable>
                        );
                      })}
                    </View>
                  )}

                  {/* Stepper */}
                  <View style={styles.stepperRow}>
                    <AnimatedPressable
                      style={[styles.stepperButton, { backgroundColor: isDark ? '#292524' : '#F5F5F4', borderColor: isDark ? '#3A3734' : '#E7E5E4' }]}
                      onPress={() => {
                        haptics.selection();
                        const next = (parseFloat(dose || '0') || 0) - doseStep;
                        setDose(String(Math.max(0, roundToStep(next, doseStep))));
                      }}
                    >
                      <FontAwesome name="minus" size={16} color={palette.textMuted} />
                    </AnimatedPressable>
                    <TextInput
                      style={[styles.doseInput, { color: palette.textPrimary }]}
                      value={dose}
                      onChangeText={setDose}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor={palette.textMuted}
                    />
                    <AnimatedPressable
                      style={[styles.stepperButton, { backgroundColor: isDark ? '#292524' : '#F5F5F4', borderColor: isDark ? '#3A3734' : '#E7E5E4' }]}
                      onPress={() => {
                        haptics.selection();
                        const next = (parseFloat(dose || '0') || 0) + doseStep;
                        setDose(String(roundToStep(next, doseStep)));
                      }}
                    >
                      <FontAwesome name="plus" size={16} color={palette.textMuted} />
                    </AnimatedPressable>
                  </View>
                  <Text style={[styles.doseUnitLabel, { color: palette.textMuted }]}>
                    {selectedCompound?.doseUnit}
                  </Text>
                </View>
              )}

              {/* Date/time row */}
              <View style={[styles.metaCard, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}>
                <View style={[styles.metaIconBadge, { backgroundColor: palette.card }]}>
                  <FontAwesome name="calendar-o" size={12} color={palette.textMuted} />
                </View>
                <AnimatedPressable
                  onPress={() => {
                    haptics.selection();
                    // On iOS, show an Alert with date options
                    const now = new Date();
                    const options = [
                      { label: 'Now', value: now.toISOString() },
                      { label: 'Yesterday same time', value: new Date(now.getTime() - 86400000).toISOString() },
                      { label: '2 days ago same time', value: new Date(now.getTime() - 172800000).toISOString() },
                    ];
                    Alert.alert(
                      'Set Date & Time',
                      `Current: ${formatDateTime(timestamp)}`,
                      [
                        ...options.map((o) => ({
                          text: o.label,
                          onPress: () => setTimestamp(o.value),
                        })),
                        { text: 'Cancel', style: 'cancel' as const },
                      ]
                    );
                  }}
                  style={{ flex: 1 }}
                >
                  <Text style={[styles.metaText, { color: palette.textSecondary }]}>
                    {formatDateTime(timestamp)}
                  </Text>
                  <Text style={[styles.metaHint, { color: palette.textMuted }]}>Tap to change</Text>
                </AnimatedPressable>
              </View>

              {/* Treatment site (read-only from protocol) */}
              {selectedCompound?.targetArea && selectedCompound.targetArea.length > 0 && (
                <View>
                  <View style={styles.siteHeaderRow}>
                    <FontAwesome name="map-marker" size={12} color={palette.textMuted} />
                    <Text style={[styles.microLabel, { color: palette.textMuted }]}>TREATMENT SITE</Text>
                  </View>
                  <View style={styles.siteChipsRow}>
                    {selectedCompound.targetArea.map((area) => (
                      <View
                        key={area}
                        style={[styles.siteChip, { backgroundColor: isDark ? '#292524' : '#F5F5F4', borderColor: isDark ? '#3A3734' : '#E7E5E4' }]}
                      >
                        <Text style={[styles.siteChipText, { color: palette.textSecondary }]}>{area}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Submit */}
                <AnimatedPressable
                onPress={() => {
                  haptics.selection();
                  void handleSubmit();
                }}
                disabled={busy}
                style={[
                  styles.submitButton,
                  busy && { opacity: 0.6 },
                  Platform.OS === 'ios' && {
                    shadowColor: '#F59E0B',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.15,
                    shadowRadius: 20,
                  },
                ]}
              >
                {busy ? (
                  <ActivityIndicator size="small" color="#1C1917" />
                ) : (
                  <FontAwesome name="check" size={18} color="#1C1917" />
                )}
                <Text style={styles.submitButtonText}>
                  {busy ? 'Saving…' : isEdit ? 'Update Entry' : 'Save Entry'}
                </Text>
              </AnimatedPressable>
            </AnimatedCard>

            {/* Recent Logs */}
            <RecentLogs compounds={compounds} isDark={isDark} palette={palette} />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

// ── Recent logs (lightweight) ─────────────────────────────────────────────────

import { listInjectionLogs } from '@/services/repository';

function RecentLogs({
  compounds,
  isDark,
  palette,
}: {
  compounds: Compound[];
  isDark: boolean;
  palette: ReturnType<typeof getUiPalette>;
}) {
  const [logs, setLogs] = useState<InjectionLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      listInjectionLogs({ limit: 5 })
        .then(setLogs)
        .catch(() => {});
    }, [])
  );

  if (logs.length === 0) return null;

  const compoundById = new Map(compounds.map((c) => [c.id, c]));

  return (
    <View>
      <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>Recent Logs</Text>
      <View style={styles.listStack}>
        {logs.map((log) => {
          const compound = compoundById.get(log.compoundId);
          const logAccent = getCompoundAccent(compound?.color);
          const logSolid = getCompoundSolidColor(compound?.color);
          return (
            <AnimatedPressable
              key={log.id}
              onPress={() => {
                haptics.selection();
                router.push({
                  pathname: '/(tabs)/log',
                  params: { logId: log.id, compoundId: log.compoundId },
                });
              }}
              style={[
                styles.recentCard,
                { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#FAFAF9' },
              ]}
            >
              <View style={[styles.recentIcon, { backgroundColor: logAccent }]}>
                <FontAwesome
                  name={getCategoryIcon(compound?.category)}
                  size={14}
                  color={logSolid}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.recentTitle, { color: palette.textPrimary }]}>
                  {compound?.name ?? 'Unknown protocol'}
                </Text>
                <Text style={[styles.recentMeta, { color: palette.textMuted }]}>
                  {log.dose} {compound?.doseUnit ?? ''} · {formatDateTime(log.timestamp)}
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={11} color={palette.textMuted} />
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: { gap: UI_LAYOUT.sectionGap },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  errorTitle: { fontSize: 18, fontWeight: '800' },
  errorBody: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontWeight: '500' },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty
  emptyCard: { borderWidth: 1, borderRadius: 32, padding: 32, alignItems: 'center', gap: 12 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: '700' },
  emptyBody: { fontSize: 13, fontWeight: '500', textAlign: 'center', lineHeight: 19 },
  goToProtocols: { minHeight: 48, borderRadius: 24, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  goToProtocolsText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  // Main card
  mainCard: {
    borderWidth: 1,
    borderRadius: 40,
    padding: 24,
    gap: 18,
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 18 }
      : {}),
  },
  cardBlob: { position: 'absolute', top: 0, left: 0, right: 0, height: 120, opacity: 0.25 },

  // Compound selector
  compoundSelector: {
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compoundDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  compoundName: { flex: 1, fontSize: 16, fontWeight: '700' },

  // Input section
  inputSection: { alignItems: 'center', gap: 12 },
  microLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    alignSelf: 'center',
  },

  // Stepper
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', justifyContent: 'center' },
  stepperButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doseInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 72,
    fontWeight: '800',
    lineHeight: 80,
  },
  doseUnitLabel: { fontSize: 20, fontWeight: '700' },

  // Presets
  presetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  presetText: { fontSize: 12, fontWeight: '800' },

  // Glide serum
  glideInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  glideTextInput: { fontSize: 16, fontWeight: '600', textAlign: 'center' },

  // Meta (date) card
  metaCard: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaIconBadge: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  metaText: { fontSize: 13, fontWeight: '600' },
  metaHint: { fontSize: 10, fontWeight: '600', marginTop: 1 },

  // Site chips
  siteHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  siteChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  siteChip: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  siteChipText: { fontSize: 12, fontWeight: '700' },

  // Submit
  submitButton: {
    height: 56,
    borderRadius: 24,
    backgroundColor: '#FDF4C4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitButtonText: { color: '#1C1917', fontSize: 17, fontWeight: '800' },

  // Recent logs
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginLeft: 2,
    marginBottom: 10,
  },
  listStack: { gap: 10 },
  recentCard: {
    borderWidth: 1,
    borderRadius: 24,
    minHeight: 70,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 10 }
      : {}),
  },
  recentIcon: { width: 40, height: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  recentTitle: { fontSize: 15, fontWeight: '700' },
  recentMeta: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  // Compound select screen
  selectScreen: { flex: 1 },
  selectHeader: { paddingHorizontal: 24, paddingTop: 60, flexDirection: 'row', justifyContent: 'flex-start' },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectTitleWrap: { alignItems: 'center', paddingTop: 20, paddingBottom: 24, paddingHorizontal: 24 },
  selectTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  selectSubtitle: { fontSize: 14, fontWeight: '500', marginTop: 4 },
  selectList: { paddingHorizontal: 24, gap: 12, paddingBottom: 40 },
  selectEmpty: { alignItems: 'center', gap: 16, paddingTop: 40 },
  selectEmptyText: { fontSize: 15, fontWeight: '600' },
  addFirstButton: { minHeight: 48, borderRadius: 24, paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center' },
  addFirstButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  selectCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 }
      : {}),
  },
  selectCardIcon: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  selectCardText: { flex: 1, gap: 6 },
  selectCardName: { fontSize: 18, fontWeight: '700' },
  selectCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  selectCardArea: { fontSize: 12, fontWeight: '600' },
  doseBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  doseBadgeText: { fontSize: 11, fontWeight: '700' },
  selectChevron: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
