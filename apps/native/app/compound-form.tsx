import React, { useEffect, useMemo, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { toDateOnly, type Compound } from '@dosebase/shared';
import { Screen } from '@/components/Screen';
import { useColorScheme } from '@/components/useColorScheme';
import { deleteCompoundById, getCompoundById, upsertCompound } from '@/services/repository';
import { getUiPalette } from '@/theme/ui';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';

type CompoundCategory = Compound['category'];
type FrequencyType = NonNullable<Compound['frequencyType']>;
type IntervalUnit = 'day' | 'week' | 'month';

type FormState = {
  name: string;
  category: CompoundCategory;
  subCategory: string;
  doseAmount: string;
  doseUnit: string;
  frequencyType: FrequencyType;
  frequencyDays: string;
  intervalUnit: IntervalUnit;
  frequencySpecificDays: string[];
  startDate: string;
  isArchived: boolean;
  color: string;
  // Reconstitution (peptide only)
  peptideAmount: string;
  dilutionAmount: string;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const BOOSTER_TYPES = [
  'PLLA',
  'Polynucleotide',
  'Hyaluronic Acid',
  'Dermal Filler',
  'PDRN',
  'Cross-linked HA',
  'PDO Threads',
  'Other',
];

const VAULT_NAME_SUGGESTIONS: Record<Exclude<CompoundCategory, 'microneedling'>, string[]> = {
  peptide: [
    'BPC-157',
    'GHK-Cu',
    'Thymosin Beta-4',
    'Semaglutide',
    'Tirzepatide',
    'Retatrutide',
    'Ipamorelin',
    'CJC-1295',
    'Tesamorelin',
    'Sermorelin',
    'Melanotan II',
    'Epitalon',
  ],
  relaxant: [
    'Botulinum Toxin Type A',
    'Botox',
    'Dysport',
    'Xeomin',
    'Jeuveau',
    'Daxxify',
  ],
  booster: [
    'PDRN (Polydeoxyribonucleotide)',
    'Polynucleotides (PN)',
    'Hyaluronic Acid (HA)',
    'Cross-linked Hyaluronic Acid',
    'PLLA (Poly-L-lactic Acid)',
    'PDO (Polydioxanone)',
    'Rejuran',
    'Profhilo',
    'Juvéderm',
    'Restylane',
  ],
};
const INTERVAL_UNIT_FACTORS: Record<IntervalUnit, number> = {
  day: 1,
  week: 7,
  month: 30,
};

const CATEGORY_META: Record<
  CompoundCategory,
  { label: string; icon: React.ComponentProps<typeof FontAwesome>['name']; unit: string; intervalDays: number }
> = {
  peptide:      { label: 'Peptide',   icon: 'medkit',      unit: 'mg',  intervalDays: 3  },
  relaxant:     { label: 'Relaxant',  icon: 'magic',       unit: 'IU',  intervalDays: 90 },
  booster:      { label: 'Booster',   icon: 'tint',        unit: 'ml',  intervalDays: 30 },
  microneedling:{ label: 'Micro',     icon: 'th',          unit: 'mm',  intervalDays: 28 },
};

const COLOR_OPTIONS = [
  { value: 'bg-red-500',     hex: '#EF4444' },
  { value: 'bg-rose-500',    hex: '#F43F5E' },
  { value: 'bg-pink-500',    hex: '#EC4899' },
  { value: 'bg-purple-500',  hex: '#A855F7' },
  { value: 'bg-indigo-500',  hex: '#6366F1' },
  { value: 'bg-blue-500',    hex: '#3B82F6' },
  { value: 'bg-sky-500',     hex: '#0EA5E9' },
  { value: 'bg-teal-500',    hex: '#14B8A6' },
  { value: 'bg-emerald-500', hex: '#10B981' },
  { value: 'bg-amber-500',   hex: '#F59E0B' },
];

const initialForm = (): FormState => ({
  name: '',
  category: 'peptide',
  subCategory: '',
  doseAmount: '',
  doseUnit: 'mg',
  frequencyType: 'specific_days',
  frequencyDays: '3',
  intervalUnit: 'day',
  frequencySpecificDays: [],
  startDate: toDateOnly(new Date()),
  isArchived: false,
  color: 'bg-indigo-500',
  peptideAmount: '',
  dilutionAmount: '',
});

function asNumber(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function calcConcentration(peptideMg: string, waterMl: string): string | null {
  const p = parseFloat(peptideMg);
  const w = parseFloat(waterMl);
  if (!Number.isFinite(p) || !Number.isFinite(w) || w === 0) return null;
  return ((p * 1000) / (w * 1000)).toFixed(2);
}

function fromStoredIntervalDays(days: number | undefined): { value: string; unit: IntervalUnit } {
  if (!days || days < 1) return { value: '1', unit: 'day' };
  if (days % INTERVAL_UNIT_FACTORS.month === 0) {
    return { value: String(days / INTERVAL_UNIT_FACTORS.month), unit: 'month' };
  }
  if (days % INTERVAL_UNIT_FACTORS.week === 0) {
    return { value: String(days / INTERVAL_UNIT_FACTORS.week), unit: 'week' };
  }
  return { value: String(days), unit: 'day' };
}

function getVaultNameSuggestions(category: CompoundCategory, query: string): string[] {
  if (category === 'microneedling') return [];
  const source = VAULT_NAME_SUGGESTIONS[category];
  const normalized = query.trim().toLowerCase();
  if (!normalized) return source.slice(0, 6);
  return source
    .filter((name) => name.toLowerCase().includes(normalized))
    .filter((name) => name.toLowerCase() !== normalized)
    .slice(0, 6);
}

export default function CompoundFormScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = typeof id === 'string' && id.length > 0;
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;
    let isMounted = true;
    setLoading(true);
    getCompoundById(id)
      .then((compound) => {
        if (!isMounted) return;
        const intervalFromStored = fromStoredIntervalDays(compound.frequencyDays);
        setForm({
          name: compound.name,
          category: compound.category,
          subCategory: compound.subCategory ?? '',
          doseAmount: compound.doseAmount === undefined ? '' : String(compound.doseAmount),
          doseUnit: compound.doseUnit || CATEGORY_META[compound.category].unit,
          frequencyType: (compound.frequencyType ?? 'interval') as FrequencyType,
          frequencyDays: intervalFromStored.value,
          intervalUnit: intervalFromStored.unit,
          frequencySpecificDays: compound.frequencySpecificDays ?? [],
          startDate: compound.startDate ?? toDateOnly(new Date()),
          isArchived: Boolean(compound.isArchived),
          color: compound.color || 'bg-indigo-500',
          peptideAmount: compound.peptideAmount !== undefined ? String(compound.peptideAmount) : '',
          dilutionAmount: compound.dilutionAmount !== undefined ? String(compound.dilutionAmount) : '',
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load protocol');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, [id, isEdit]);

  const palette = useMemo(() => getUiPalette(isDark), [isDark]);
  const tabBarHeight = useTabBarHeight();
  const cardBg = palette.card;
  const cardBorder = palette.cardBorder;
  const fieldBg = palette.field;
  const textPrimary = palette.textPrimary;
  const textMuted = palette.textMuted;

  const onCategoryChange = (nextCategory: CompoundCategory) => {
    const meta = CATEGORY_META[nextCategory];
    const intervalFromMeta = fromStoredIntervalDays(meta.intervalDays);
    setForm((prev) => ({
      ...prev,
      name: nextCategory === 'microneedling' ? 'Microneedling' : prev.name,
      category: nextCategory,
      subCategory: nextCategory === 'booster' ? (prev.subCategory || BOOSTER_TYPES[0]) : '',
      doseUnit: meta.unit,
      frequencyType: nextCategory === 'peptide' ? 'specific_days' : 'interval',
      frequencyDays: intervalFromMeta.value,
      intervalUnit: intervalFromMeta.unit,
      frequencySpecificDays: [],
    }));
    setShowNameSuggestions(false);
  };

  const toggleDay = (day: string) => {
    setForm((prev) => {
      const exists = prev.frequencySpecificDays.includes(day);
      return {
        ...prev,
        frequencySpecificDays: exists
          ? prev.frequencySpecificDays.filter((d) => d !== day)
          : [...prev.frequencySpecificDays, day],
      };
    });
  };

  const onSave = async () => {
    const normalizedName =
      form.category === 'microneedling' ? form.name.trim() || 'Microneedling' : form.name.trim();
    if (!normalizedName) {
      Alert.alert('Missing name', 'Please provide a protocol name.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.startDate)) {
      Alert.alert('Invalid date', 'Start date must be in YYYY-MM-DD format.');
      return;
    }
    if (form.frequencyType === 'interval') {
      const intervalValue = Number(form.frequencyDays);
      if (!Number.isFinite(intervalValue) || intervalValue < 1) {
        Alert.alert('Invalid frequency', 'Interval must be at least 1.');
        return;
      }
    }
    if (form.frequencyType === 'specific_days' && form.frequencySpecificDays.length === 0) {
      Alert.alert('Select weekdays', 'Pick at least one weekday for this protocol.');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Compound> & { name: string } = {
        ...(isEdit && id ? { id } : {}),
        name: normalizedName,
        category: form.category,
        subCategory: form.category === 'booster' ? form.subCategory || BOOSTER_TYPES[0] : undefined,
        doseUnit: form.doseUnit.trim() || CATEGORY_META[form.category].unit,
        doseAmount: asNumber(form.doseAmount),
        frequencyType: form.frequencyType,
        frequencyDays:
          form.frequencyType === 'interval'
            ? (() => {
                const value = asNumber(form.frequencyDays);
                if (value === undefined) return undefined;
                return value * INTERVAL_UNIT_FACTORS[form.intervalUnit];
              })()
            : undefined,
        frequencySpecificDays:
          form.frequencyType === 'specific_days' ? form.frequencySpecificDays : undefined,
        startDate: form.startDate,
        isArchived: form.isArchived,
        color: form.color,
        peptideAmount: asNumber(form.peptideAmount),
        dilutionAmount: asNumber(form.dilutionAmount),
      };
      await upsertCompound(payload);
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)/protocols');
    } catch (err) {
      Alert.alert('Save failed', err instanceof Error ? err.message : 'Could not save protocol.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    if (!isEdit || !id || deleting) return;
    Alert.alert('Delete protocol?', 'This will permanently remove this protocol.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await deleteCompoundById(id);
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)/protocols');
          } catch (err) {
            Alert.alert('Delete failed', err instanceof Error ? err.message : 'Could not delete protocol.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  // Reconstitution result
  const concentration = calcConcentration(form.peptideAmount, form.dilutionAmount);
  const showReconstitution = form.category === 'peptide';
  const nameSuggestions = useMemo(
    () => getVaultNameSuggestions(form.category, form.name),
    [form.category, form.name]
  );
  const nameFieldLabel =
    form.category === 'relaxant'
      ? 'Brand Name'
      : form.category === 'booster'
        ? 'Skin Booster Brand Name'
        : 'Protocol Name';
  const namePlaceholder =
    form.category === 'relaxant'
      ? 'e.g. Botox, Dysport'
      : form.category === 'booster'
        ? 'e.g. Rejuran, Profhilo'
        : 'e.g. BPC-157';
  const isPeptideLocked = isEdit && form.category === 'peptide';

  return (
    <Screen>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight }]} showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace('/(tabs)/protocols')
            }
            style={[
              styles.backBtn,
              { backgroundColor: cardBg, borderColor: cardBorder },
              ...(Platform.OS === 'ios'
                ? [{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 }]
                : []),
            ]}
          >
            <FontAwesome name="chevron-left" size={14} color={textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>
            {isEdit ? 'Edit Protocol' : 'New Protocol'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: '#EF4444' }]}>{error}</Text>
        ) : null}

        {/* ── CATEGORY SELECTOR ── */}
        <View
          style={[
            styles.categoryCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
            ...(Platform.OS === 'ios'
              ? [{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 }]
              : []),
          ]}
        >
          {(Object.keys(CATEGORY_META) as CompoundCategory[]).map((cat) => {
            const active = form.category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => onCategoryChange(cat)}
                disabled={isPeptideLocked}
                style={[
                  styles.categoryBtn,
                  isPeptideLocked ? styles.categoryBtnLocked : null,
                  active
                    ? [
                        styles.categoryBtnActive,
                        ...(Platform.OS === 'ios'
                          ? [{ shadowColor: '#1C1917', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12 }]
                          : []),
                      ]
                    : { backgroundColor: fieldBg },
                ]}
              >
                <FontAwesome
                  name={CATEGORY_META[cat].icon}
                  size={18}
                  color={active ? '#FFFFFF' : textMuted}
                />
                <Text style={[styles.categoryBtnText, { color: active ? '#FFFFFF' : textMuted }]}>
                  {CATEGORY_META[cat].label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── IDENTITY SECTION ── */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: textMuted }]}>Identity</Text>

          {form.category === 'booster' ? (
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: textMuted }]}>Skin Booster Type</Text>
              <View style={styles.boosterTypeRow}>
                {BOOSTER_TYPES.map((type) => {
                  const active = (form.subCategory || BOOSTER_TYPES[0]) === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => setForm((prev) => ({ ...prev, subCategory: type }))}
                      style={[
                        styles.boosterTypeChip,
                        active
                          ? [styles.freqBtnActive, { backgroundColor: isDark ? '#FAFAF9' : '#1C1917' }]
                          : { backgroundColor: fieldBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.boosterTypeChipText,
                          { color: active ? (isDark ? '#1C1917' : '#FFFFFF') : textMuted },
                        ]}
                      >
                        {type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {form.category === 'microneedling' ? (
            <View style={[styles.microInfoCard, { backgroundColor: fieldBg }]}>
              <FontAwesome name="calendar" size={16} color={textMuted} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.microInfoTitle, { color: textPrimary }]}>Microneedling Activity</Text>
                <Text style={[styles.microInfoBody, { color: textMuted }]}>
                  Name is not required. This tab is for scheduling your microneedling sessions.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: textMuted }]}>{nameFieldLabel}</Text>
              <TextInput
                value={form.name}
                onChangeText={(name) => {
                  setForm((prev) => ({ ...prev, name }));
                  setShowNameSuggestions(true);
                }}
                placeholder={namePlaceholder}
                placeholderTextColor={textMuted}
                editable={!isPeptideLocked}
                onFocus={() => {
                  if (!isPeptideLocked) setShowNameSuggestions(true);
                }}
                style={[
                  styles.input,
                  { color: textPrimary, backgroundColor: fieldBg },
                  isPeptideLocked ? styles.inputLocked : null,
                ]}
              />
              {isPeptideLocked ? (
                <Text style={[styles.fieldHint, { color: textMuted }]}>
                  Peptide protocol type and name are locked after creation.
                </Text>
              ) : null}
              {showNameSuggestions && nameSuggestions.length > 0 ? (
                <View style={[styles.suggestionsCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                  {nameSuggestions.map((suggestion) => (
                    <Pressable
                      key={suggestion}
                      onPress={() => {
                        setForm((prev) => ({ ...prev, name: suggestion }));
                        setShowNameSuggestions(false);
                      }}
                      style={styles.suggestionItem}
                    >
                      <Text style={[styles.suggestionText, { color: textPrimary }]}>{suggestion}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          )}

          {/* Dose + Unit (hidden for microneedling) */}
          {form.category !== 'microneedling' ? (
            <View style={styles.row}>
              <View style={[styles.rowItem, { flex: 2 }]}>
                <Text style={[styles.fieldLabel, { color: textMuted }]}>Dose Amount</Text>
                <TextInput
                  value={form.doseAmount}
                  onChangeText={(doseAmount) => setForm((prev) => ({ ...prev, doseAmount }))}
                  keyboardType="decimal-pad"
                  placeholder="250"
                  placeholderTextColor={textMuted}
                  style={[styles.input, { color: textPrimary, backgroundColor: fieldBg }]}
                />
              </View>
              <View style={[styles.rowItem, { flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: textMuted }]}>Unit</Text>
                <TextInput
                  value={form.doseUnit}
                  onChangeText={(doseUnit) => setForm((prev) => ({ ...prev, doseUnit }))}
                  placeholder={CATEGORY_META[form.category].unit}
                  placeholderTextColor={textMuted}
                  style={[styles.input, { color: textPrimary, backgroundColor: fieldBg }]}
                />
              </View>
            </View>
          ) : null}
        </View>

        {/* ── SCHEDULE SECTION ── */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: textMuted }]}>Schedule</Text>

          {/* Start Date */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: textMuted }]}>Start Date (YYYY-MM-DD)</Text>
            <View style={[styles.dateRow, { backgroundColor: fieldBg }]}>
              <FontAwesome name="calendar" size={14} color={textMuted} />
              <TextInput
                value={form.startDate}
                onChangeText={(startDate) => setForm((prev) => ({ ...prev, startDate }))}
                placeholder={toDateOnly(new Date())}
                placeholderTextColor={textMuted}
                style={[styles.dateInput, { color: textPrimary }]}
              />
            </View>
          </View>

          {/* Frequency Toggle */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: textMuted }]}>Frequency</Text>
            <View style={[styles.freqToggle, { backgroundColor: fieldBg }]}>
              <Pressable
                onPress={() => setForm((prev) => ({ ...prev, frequencyType: 'specific_days' }))}
                style={[
                  styles.freqBtn,
                  form.frequencyType === 'specific_days'
                    ? [styles.freqBtnActive, { backgroundColor: isDark ? '#FAFAF9' : '#1C1917' }]
                    : null,
                ]}
                >
                  <Text
                    style={[
                      styles.freqBtnText,
                    {
                      color: form.frequencyType === 'specific_days'
                        ? (isDark ? '#1C1917' : '#FFFFFF')
                        : textMuted,
                    },
                  ]}
                >
                  Day of Week
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setForm((prev) => ({ ...prev, frequencyType: 'interval' }))}
                style={[
                  styles.freqBtn,
                  form.frequencyType === 'interval'
                    ? [styles.freqBtnActive, { backgroundColor: isDark ? '#FAFAF9' : '#1C1917' }]
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.freqBtnText,
                    {
                      color: form.frequencyType === 'interval'
                        ? (isDark ? '#1C1917' : '#FFFFFF')
                        : textMuted,
                    },
                  ]}
                >
                  Interval
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Weekdays or Interval input */}
          {form.frequencyType === 'specific_days' ? (
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((day) => {
                const active = form.frequencySpecificDays.includes(day);
                return (
                  <Pressable
                    key={day}
                    onPress={() => toggleDay(day)}
                    style={[
                      styles.weekdayChip,
                      active
                        ? [
                            { backgroundColor: isDark ? '#FAFAF9' : '#1C1917' },
                            ...(Platform.OS === 'ios'
                              ? [{
                                  shadowColor: '#1C1917',
                                  shadowOffset: { width: 0, height: 4 },
                                  shadowOpacity: 0.18,
                                  shadowRadius: 8,
                                }]
                              : []),
                          ]
                        : { backgroundColor: fieldBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekdayText,
                        {
                          color: active
                            ? (isDark ? '#1C1917' : '#FFFFFF')
                            : textMuted,
                        },
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: textMuted }]}>Every</Text>
              <View style={styles.intervalRow}>
                <TextInput
                  value={form.frequencyDays}
                  onChangeText={(frequencyDays) => setForm((prev) => ({ ...prev, frequencyDays }))}
                  keyboardType="number-pad"
                  placeholder="3"
                  placeholderTextColor={textMuted}
                  style={[styles.intervalInput, { color: textPrimary, backgroundColor: fieldBg }]}
                />
                <View style={[styles.intervalUnitGroup, { backgroundColor: fieldBg }]}>
                  {(['day', 'week', 'month'] as const).map((unit) => {
                    const active = form.intervalUnit === unit;
                    return (
                      <Pressable
                        key={unit}
                        onPress={() => setForm((prev) => ({ ...prev, intervalUnit: unit }))}
                        style={[
                          styles.intervalUnitBtn,
                          active
                            ? [styles.freqBtnActive, { backgroundColor: isDark ? '#FAFAF9' : '#1C1917' }]
                            : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.intervalUnitBtnText,
                            {
                              color: active
                                ? (isDark ? '#1C1917' : '#FFFFFF')
                                : textMuted,
                            },
                          ]}
                        >
                          {unit === 'day' ? 'Day' : unit === 'week' ? 'Week' : 'Month'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* ── COLOR LABEL SECTION ── */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: textMuted }]}>Color Label</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorScroll}>
            {COLOR_OPTIONS.map((opt) => {
              const active = form.color === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setForm((prev) => ({ ...prev, color: opt.value }))}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: opt.hex },
                    active && styles.colorSwatchActive,
                  ]}
                >
                  {active ? (
                    <FontAwesome name="check" size={14} color="#FFFFFF" />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── RECONSTITUTION CALCULATOR (peptide only) ── */}
        {showReconstitution ? (
          <View
            style={[
              styles.reconCard,
              { borderColor: isDark ? 'rgba(68,64,60,0.5)' : 'rgba(214,211,208,0.5)', backgroundColor: isDark ? 'rgba(28,25,23,0.5)' : 'rgba(245,245,244,0.5)' },
            ]}
          >
            {/* Header */}
            <View style={styles.reconHeader}>
              <View style={[styles.reconIconWrap, { backgroundColor: '#CBE4F9' }]}>
                <FontAwesome name="tint" size={14} color="#3B82F6" />
              </View>
              <View>
                <Text style={[styles.reconTitle, { color: textPrimary }]}>Reconstitution</Text>
                <Text style={[styles.reconSub, { color: textMuted }]}>Optional – calculate concentration</Text>
              </View>
            </View>

            {/* Inputs */}
            <View style={styles.row}>
              <View style={styles.rowItem}>
                <Text style={[styles.fieldLabel, { color: textMuted }]}>Total Amount (mg)</Text>
                <TextInput
                  value={form.peptideAmount}
                  onChangeText={(peptideAmount) => setForm((prev) => ({ ...prev, peptideAmount }))}
                  keyboardType="decimal-pad"
                  placeholder="5"
                  placeholderTextColor={textMuted}
                  style={[styles.input, { color: textPrimary, backgroundColor: fieldBg }]}
                />
              </View>
              <View style={styles.rowItem}>
                <Text style={[styles.fieldLabel, { color: textMuted }]}>Water Added (ml)</Text>
                <TextInput
                  value={form.dilutionAmount}
                  onChangeText={(dilutionAmount) => setForm((prev) => ({ ...prev, dilutionAmount }))}
                  keyboardType="decimal-pad"
                  placeholder="2"
                  placeholderTextColor={textMuted}
                  style={[styles.input, { color: textPrimary, backgroundColor: fieldBg }]}
                />
              </View>
            </View>

            {/* Result */}
            {concentration ? (
              <View
                style={[
                  styles.reconResult,
                  { backgroundColor: isDark ? '#FAFAF9' : '#1C1917' },
                  ...(Platform.OS === 'ios'
                    ? [{ shadowColor: '#1C1917', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16 }]
                    : []),
                ]}
              >
                <Text style={[styles.reconResultLabel, { color: isDark ? '#78716C' : '#A8A29E' }]}>
                  CONCENTRATION
                </Text>
                <Text style={[styles.reconResultValue, { color: isDark ? '#1C1917' : '#FFFFFF' }]}>
                  {concentration} mg/ml
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* ── SAVE BUTTON ── */}
        <Pressable
          onPress={onSave}
          disabled={saving || loading}
          style={[
            styles.saveBtn,
            { backgroundColor: isDark ? '#FAFAF9' : '#1C1917' },
            (saving || loading) && styles.disabled,
            ...(Platform.OS === 'ios'
              ? [{
                  shadowColor: '#1C1917',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0 : 0.22,
                  shadowRadius: 20,
                }]
              : []),
          ]}
        >
          <FontAwesome
            name={saving ? 'circle-o-notch' : 'check'}
            size={18}
            color={isDark ? '#1C1917' : '#FFFFFF'}
          />
          <Text style={[styles.saveBtnText, { color: isDark ? '#1C1917' : '#FFFFFF' }]}>
            {saving ? 'Saving…' : isEdit ? 'Save Protocol' : 'Create Protocol'}
          </Text>
        </Pressable>

        {/* ── DELETE BUTTON (edit only) ── */}
        {isEdit ? (
          <Pressable
            onPress={onDelete}
            disabled={deleting || saving}
            style={[styles.deleteBtn, (deleting || saving) && styles.disabled]}
          >
            <FontAwesome name="trash" size={15} color="#DC2626" />
            <Text style={styles.deleteBtnText}>
              {deleting ? 'Deleting…' : 'Delete Protocol'}
            </Text>
          </Pressable>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: { gap: 16 },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  headerSpacer: { width: 40, height: 40 },
  errorText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  // Category card
  categoryCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 8,
    flexDirection: 'row',
    gap: 6,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
        }
      : {}),
  },
  categoryBtn: {
    flex: 1,
    minHeight: 68,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 4,
  },
  categoryBtnLocked: {
    opacity: 0.6,
  },
  categoryBtnActive: {
    backgroundColor: '#1C1917',
  },
  categoryBtnText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  // Section cards
  sectionCard: {
    borderRadius: 32,
    borderWidth: 1,
    padding: 24,
    gap: 14,
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 12,
        }
      : {}),
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },

  // Field groups
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  fieldHint: { fontSize: 11, fontWeight: '500' },

  input: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
  },
  inputLocked: {
    opacity: 0.7,
  },
  suggestionsCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 2,
  },
  suggestionItem: {
    minHeight: 42,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(168,162,158,0.35)',
  },
  suggestionText: { fontSize: 13, fontWeight: '700' },
  boosterTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  boosterTypeChip: {
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boosterTypeChipText: { fontSize: 11, fontWeight: '700' },
  microInfoCard: {
    borderRadius: 16,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  microInfoTitle: { fontSize: 13, fontWeight: '700' },
  microInfoBody: { fontSize: 11, fontWeight: '500', lineHeight: 15 },
  row: { flexDirection: 'row', gap: 10 },
  rowItem: { flex: 1, gap: 6 },

  // Date row
  dateRow: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateInput: { flex: 1, fontSize: 16, fontWeight: '700' },

  // Frequency
  freqToggle: {
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  freqBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freqBtnActive: {
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
        }
      : {}),
  },
  freqBtnText: { fontSize: 12, fontWeight: '700' },

  // Weekdays
  weekdayRow: { flexDirection: 'row', flexWrap: 'nowrap', gap: 6 },
  weekdayChip: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: { fontSize: 10, fontWeight: '800' },

  // Interval input
  intervalRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  intervalInput: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: '800',
    width: 92,
    textAlign: 'center',
  },
  intervalUnitGroup: {
    flex: 1,
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  intervalUnitBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intervalUnitBtnText: { fontSize: 12, fontWeight: '700' },

  // Color swatches
  colorScroll: { gap: 10, paddingVertical: 4 },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: 'rgba(28,25,23,0.3)',
    transform: [{ scale: 1.1 }],
  },

  // Reconstitution
  reconCard: {
    borderRadius: 32,
    borderWidth: 1,
    padding: 24,
    gap: 14,
  },
  reconHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reconIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reconTitle: { fontSize: 14, fontWeight: '800' },
  reconSub: { fontSize: 11, fontWeight: '500' },
  reconResult: {
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    gap: 4,
  },
  reconResultLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  reconResultValue: { fontSize: 24, fontWeight: '800' },

  // Save button
  saveBtn: {
    height: 58,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveBtnText: { fontSize: 17, fontWeight: '800' },

  // Delete button
  deleteBtn: {
    height: 52,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteBtnText: { color: '#DC2626', fontSize: 14, fontWeight: '700' },

  disabled: { opacity: 0.6 },
});
