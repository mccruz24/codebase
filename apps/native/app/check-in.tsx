import React, { useCallback, useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/components/useColorScheme';
import { useProfile } from '@/contexts/ProfileContext';
import { deleteCheckInByDate, getCheckInByDate, upsertCheckIn } from '@/services/repository';
import { getUiPalette, UI_LAYOUT } from '@/theme/ui';

// ── Metric definitions ────────────────────────────────────────────────────────

const METRIC_LABELS: Record<string, string> = {
  muscleFullness: 'Muscle Fullness',
  skinClarity: 'Skin Clarity',
  skinTexture: 'Skin Texture',
  facialFullness: 'Facial Fullness',
  inflammation: 'Inflammation (Low to High)',
  jawlineDefinition: 'Jawline Definition',
  energy: 'Energy',
  sleepQuality: 'Sleep Quality',
  libido: 'Libido',
};

const METRIC_DESCRIPTIONS: Record<string, string> = {
  muscleFullness: "How 'pumped', dense, or glycogen-filled your muscles feel throughout the day.",
  skinClarity: 'The overall clearness of your skin, absence of acne, redness, or excessive oiliness.',
  skinTexture: 'The smoothness and evenness of your skin surface (bumps, roughness, etc).',
  facialFullness: "The amount of water retention or 'bloat' visible in your face.",
  jawlineDefinition: 'Sharpness and visibility of your jawline, often an indicator of lower water retention.',
  inflammation: 'General feeling of systemic inflammation, joint stiffness, or water weight.',
  energy: 'Your sustained energy levels throughout the day without excessive fatigue.',
  sleepQuality: 'How restful and uninterrupted your sleep was last night.',
  libido: 'Your current level of sexual drive and desire.',
};

type RatingsKey =
  | 'muscleFullness'
  | 'skinClarity'
  | 'skinTexture'
  | 'facialFullness'
  | 'inflammation'
  | 'jawlineDefinition'
  | 'energy'
  | 'sleepQuality'
  | 'libido';

const DEFAULT_RATINGS: Record<RatingsKey, number> = {
  muscleFullness: 5,
  skinClarity: 5,
  skinTexture: 5,
  facialFullness: 5,
  inflammation: 5,
  jawlineDefinition: 5,
  energy: 5,
  sleepQuality: 5,
  libido: 5,
};

function toDateOnly(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parseWeightInput(value: string, units: 'metric' | 'imperial'): number | null {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return units === 'metric' ? n / 0.45359237 : n;
}

function formatDateLabel(dateOnly: string) {
  return new Date(`${dateOnly}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

// ── Slider row ────────────────────────────────────────────────────────────────

function SliderRow({
  metricKey,
  value,
  onChange,
  onInfo,
  isDark,
  palette,
}: {
  metricKey: RatingsKey;
  value: number;
  onChange: (v: number) => void;
  onInfo: (key: string) => void;
  isDark: boolean;
  palette: ReturnType<typeof getUiPalette>;
}) {
  return (
    <View style={[slStyles.wrap, { backgroundColor: isDark ? '#1E1C1A' : '#F5F5F4' }]}>
      {/* Header */}
      <View style={slStyles.header}>
        <View style={slStyles.labelRow}>
          <Text style={[slStyles.label, { color: palette.textMuted }]}>{METRIC_LABELS[metricKey]}</Text>
          <Pressable onPress={() => onInfo(metricKey)}>
            <FontAwesome name="info-circle" size={14} color={palette.textMuted} />
          </Pressable>
        </View>
        <View style={[slStyles.valueBadge, { backgroundColor: '#1C1917' }]}>
          <Text style={slStyles.valueText}>{value}</Text>
        </View>
      </View>

      {/* Tick labels */}
      <View style={slStyles.tickRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <Text key={n} style={[slStyles.tickLabel, { color: palette.textMuted }]}>{n}</Text>
        ))}
      </View>

      {/* Tap-based slider: 10 segments */}
      <View style={slStyles.segmentRow}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            style={[
              slStyles.segment,
              {
                backgroundColor:
                  n <= value
                    ? '#1C1917'
                    : isDark ? '#292524' : '#E7E5E4',
                borderRadius:
                  n === 1
                    ? 999
                    : n === 10
                    ? 999
                    : 4,
              },
            ]}
          />
        ))}
      </View>

      {/* Low / High */}
      <View style={slStyles.rangeRow}>
        <Text style={[slStyles.rangeLabel, { color: palette.textMuted }]}>Low</Text>
        <Text style={[slStyles.rangeLabel, { color: palette.textMuted }]}>High</Text>
      </View>
    </View>
  );
}

const slStyles = StyleSheet.create({
  wrap: { borderRadius: 24, padding: 20, gap: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  valueBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  tickRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
  tickLabel: { fontSize: 9, fontWeight: '700', width: 16, textAlign: 'center' },
  segmentRow: { flexDirection: 'row', gap: 4, height: 20 },
  segment: { flex: 1, height: 20 },
  rangeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  rangeLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
});

// ── Main Check-In Screen ──────────────────────────────────────────────────────

export default function CheckInScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = getUiPalette(isDark);
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const units = profile?.units ?? 'imperial';
  const params = useLocalSearchParams<{ date?: string }>();

  const dateOnly =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : toDateOnly(new Date());

  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weight, setWeight] = useState('');
  const [ratings, setRatings] = useState<Record<RatingsKey, number>>(DEFAULT_RATINGS);
  const [infoModal, setInfoModal] = useState<string | null>(null);
  const [hasExisting, setHasExisting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getCheckInByDate(dateOnly)
      .then((existing) => {
        if (!isMounted || !existing) return;
        setHasExisting(true);
        if (existing.weight !== undefined) {
          const display =
            units === 'metric'
              ? (existing.weight * 0.45359237).toFixed(1)
              : existing.weight.toFixed(1);
          setWeight(display);
        }
        setRatings({
          muscleFullness: existing.metrics.muscleFullness,
          skinClarity: existing.metrics.skinClarity,
          skinTexture: existing.metrics.skinTexture,
          facialFullness: existing.metrics.facialFullness,
          inflammation: existing.metrics.inflammation,
          jawlineDefinition: existing.metrics.jawlineDefinition,
          energy: existing.metrics.energy,
          sleepQuality: existing.metrics.sleepQuality,
          libido: existing.metrics.libido,
        });
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [dateOnly, units]);

  const handleRatingChange = useCallback((key: RatingsKey, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const weightLb = weight ? parseWeightInput(weight, units) : null;
    if (weight && weightLb === null) {
      Alert.alert('Invalid weight', 'Please enter a valid number.');
      return;
    }
    setBusy(true);
    try {
      await upsertCheckIn({
        date: dateOnly,
        weight: weightLb === null ? undefined : weightLb,
        metrics: ratings,
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save check-in');
    } finally {
      setBusy(false);
    }
  }, [weight, units, dateOnly, ratings]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete check-in',
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await deleteCheckInByDate(dateOnly);
              router.back();
            } catch (err) {
              Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete');
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  }, [dateOnly]);

  if (loading) {
    return (
      <View style={[styles.fill, { backgroundColor: palette.background }]}>
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color={palette.textSecondary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.fill, { backgroundColor: palette.background }]}>
      {/* Info modal */}
      <Modal
        transparent
        visible={Boolean(infoModal)}
        animationType="fade"
        onRequestClose={() => setInfoModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setInfoModal(null)} />
          <View style={[styles.infoCard, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' }]}>
            <View style={styles.infoCardHeader}>
              <Text style={[styles.infoCardTitle, { color: palette.textPrimary }]}>
                {infoModal ? METRIC_LABELS[infoModal] : ''}
              </Text>
              <Pressable
                onPress={() => setInfoModal(null)}
                style={[styles.infoCloseButton, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}
              >
                <FontAwesome name="times" size={14} color={palette.textMuted} />
              </Pressable>
            </View>
            <Text style={[styles.infoCardBody, { color: palette.textSecondary }]}>
              {infoModal ? METRIC_DESCRIPTIONS[infoModal] : ''}
            </Text>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32, paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' }]}
          >
            <FontAwesome name="chevron-left" size={14} color={palette.textMuted} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Log Your Progress</Text>
            <Text style={[styles.headerSub, { color: palette.textMuted }]}>HEALTH JOURNEY TRACKER</Text>
          </View>
          {hasExisting ? (
            <Pressable
              onPress={handleDelete}
              style={[styles.backButton, { backgroundColor: isDark ? '#292524' : '#FEE2E2', borderColor: isDark ? '#3A3734' : '#FECACA' }]}
            >
              <FontAwesome name="trash-o" size={15} color="#EF4444" />
            </Pressable>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        {/* Date badge */}
        <View style={styles.dateBadgeWrap}>
          <View style={[styles.dateBadge, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' }]}>
            <FontAwesome name="calendar-o" size={14} color={palette.textMuted} />
            <Text style={[styles.dateBadgeText, { color: palette.textSecondary }]}>
              {formatDateLabel(dateOnly)}
            </Text>
          </View>
        </View>

        {/* Weight card */}
        <View style={[styles.weightCard, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#FAFAF9' }]}>
          <View style={styles.weightTopBar} />
          <Text style={[styles.weightLabel, { color: palette.textMuted }]}>CURRENT BODY WEIGHT</Text>
          <View style={styles.weightInputRow}>
            <TextInput
              style={[styles.weightInput, { color: palette.textPrimary, borderBottomColor: isDark ? '#292524' : '#E7E5E4' }]}
              value={weight}
              onChangeText={setWeight}
              placeholder="---"
              placeholderTextColor={palette.textMuted}
              keyboardType="decimal-pad"
              textAlign="center"
            />
            <Text style={[styles.weightUnit, { color: palette.textMuted }]}>
              {units === 'metric' ? 'kg' : 'lbs'}
            </Text>
          </View>
        </View>

        {/* Aesthetics section */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Physical Aesthetics</Text>
          <View style={styles.slidersStack}>
            {(['muscleFullness', 'skinClarity', 'skinTexture', 'facialFullness', 'jawlineDefinition', 'inflammation'] as RatingsKey[]).map((key) => (
              <SliderRow
                key={key}
                metricKey={key}
                value={ratings[key]}
                onChange={(v) => handleRatingChange(key, v)}
                onInfo={setInfoModal}
                isDark={isDark}
                palette={palette}
              />
            ))}
          </View>
        </View>

        {/* Well-being section */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Internal Well-being</Text>
          <View style={styles.slidersStack}>
            {(['energy', 'sleepQuality', 'libido'] as RatingsKey[]).map((key) => (
              <SliderRow
                key={key}
                metricKey={key}
                value={ratings[key]}
                onChange={(v) => handleRatingChange(key, v)}
                onInfo={setInfoModal}
                isDark={isDark}
                palette={palette}
              />
            ))}
          </View>
        </View>

        {/* Save button */}
        <Pressable
          onPress={() => void handleSubmit()}
          disabled={busy}
          style={[
            styles.saveButton,
            { backgroundColor: isDark ? '#FAFAF9' : '#1C1917' },
            busy && { opacity: 0.6 },
            Platform.OS === 'ios' && {
              shadowColor: '#1C1917',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
            },
          ]}
        >
          {busy ? (
            <ActivityIndicator size="small" color={isDark ? '#1C1917' : '#FFFFFF'} />
          ) : (
            <FontAwesome name="save" size={18} color={isDark ? '#1C1917' : '#FFFFFF'} />
          )}
          <Text style={[styles.saveButtonText, { color: isDark ? '#1C1917' : '#FFFFFF' }]}>
            {busy ? 'Saving…' : 'Save Log Entry'}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: UI_LAYOUT.pagePadding, gap: 20 },

  // Header
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 3 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  headerSub: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.4 },
  headerSpacer: { width: 44 },

  // Date badge
  dateBadgeWrap: { alignItems: 'center' },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 }
      : {}),
  },
  dateBadgeText: { fontSize: 14, fontWeight: '700' },

  // Weight card
  weightCard: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    overflow: 'hidden',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 }
      : {}),
  },
  weightTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#CDF5E3',
  },
  weightLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  weightInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  weightInput: {
    fontSize: 64,
    fontWeight: '800',
    width: 160,
    borderBottomWidth: 2,
    paddingBottom: 4,
  },
  weightUnit: { fontSize: 18, fontWeight: '700', marginBottom: 10 },

  // Sections
  sectionWrap: {
    gap: 12,
    backgroundColor: 'transparent',
    borderRadius: 32,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', paddingHorizontal: 4 },
  slidersStack: { gap: 10 },

  // Save button
  saveButton: {
    height: 60,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  saveButtonText: { fontSize: 17, fontWeight: '800' },

  // Info modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(28,25,23,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  infoCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 32,
    borderWidth: 1,
    padding: 24,
    gap: 12,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.12, shadowRadius: 40 }
      : {}),
  },
  infoCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoCardTitle: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 },
  infoCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardBody: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
});
