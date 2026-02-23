import React, { useEffect, useMemo, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Modal,
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
import { listCheckIns, listCompounds, listInjectionLogs } from '@/services/repository';
import { UI_LAYOUT, getUiPalette } from '@/theme/ui';
import {
  getLogsOnDate,
  getScheduledCompounds,
  toDateOnly,
  type AestheticCheckIn,
  type Compound,
  type InjectionLog,
} from '@dosebase/shared';

type CalendarCell = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasLog: boolean;
  hasSchedule: boolean;
  hasCheckIn: boolean;
};

function buildMonthCells(
  monthAnchor: Date,
  compounds: Compound[],
  injections: InjectionLog[],
  checkIns: AestheticCheckIn[]
): CalendarCell[] {
  const year = monthAnchor.getFullYear();
  const month = monthAnchor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: CalendarCell[] = [];
  const today = new Date();
  const checkInMap = new Map(checkIns.map((item) => [item.date, item]));

  for (let i = firstWeekday - 1; i >= 0; i -= 1) {
    const date = new Date(year, month, -i);
    const dateOnly = toDateOnly(date);
    const hasLog = getLogsOnDate(injections, date).length > 0;
    const hasSchedule = getScheduledCompounds(compounds, date).length > 0;
    cells.push({
      date,
      isCurrentMonth: false,
      isToday: today.toDateString() === date.toDateString(),
      hasLog,
      hasSchedule,
      hasCheckIn: checkInMap.has(dateOnly),
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateOnly = toDateOnly(date);
    const hasLog = getLogsOnDate(injections, date).length > 0;
    const hasSchedule = getScheduledCompounds(compounds, date).length > 0;
    cells.push({
      date,
      isCurrentMonth: true,
      isToday: today.toDateString() === date.toDateString(),
      hasLog,
      hasSchedule,
      hasCheckIn: checkInMap.has(dateOnly),
    });
  }

  while (cells.length % 7 !== 0) {
    const date = new Date(year, month, daysInMonth + (cells.length % 7) + 1);
    const dateOnly = toDateOnly(date);
    const hasLog = getLogsOnDate(injections, date).length > 0;
    const hasSchedule = getScheduledCompounds(compounds, date).length > 0;
    cells.push({
      date,
      isCurrentMonth: false,
      isToday: today.toDateString() === date.toDateString(),
      hasLog,
      hasSchedule,
      hasCheckIn: checkInMap.has(dateOnly),
    });
  }

  return cells;
}

export default function CalendarScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = getUiPalette(isDark);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [injections, setInjections] = useState<InjectionLog[]>([]);
  const [checkIns, setCheckIns] = useState<AestheticCheckIn[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      const [allCompounds, allInjections, allCheckIns] = await Promise.all([
        listCompounds({ includeArchived: true }),
        listInjectionLogs({ limit: 1000 }),
        listCheckIns({ limit: 366 }),
      ]);
      if (!isMounted) return;
      setCompounds(allCompounds.filter((item) => !item.isArchived));
      setInjections(allInjections);
      setCheckIns(allCheckIns);
    };
    run()
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load calendar');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const cells = useMemo(
    () => buildMonthCells(monthAnchor, compounds, injections, checkIns),
    [monthAnchor, compounds, injections, checkIns]
  );

  const selectedScheduled = useMemo(
    () => (selectedDate ? getScheduledCompounds(compounds, selectedDate) : []),
    [compounds, selectedDate]
  );
  const selectedLogs = useMemo(
    () => (selectedDate ? getLogsOnDate(injections, selectedDate) : []),
    [injections, selectedDate]
  );
  const selectedCheckIn = useMemo(() => {
    if (!selectedDate) return null;
    const dateOnly = toDateOnly(selectedDate);
    return checkIns.find((item) => item.date === dateOnly) ?? null;
  }, [checkIns, selectedDate]);

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
          <Text style={[styles.errorTitle, { color: palette.textPrimary }]}>Calendar unavailable</Text>
          <Text style={[styles.errorBody, { color: palette.textMuted }]}>{error}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: UI_LAYOUT.tabPageTopPadding, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.navButton, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' }]}
          >
            <FontAwesome name="chevron-left" size={14} color={palette.textMuted} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Calendar</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={[styles.monthCard, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#FAFAF9' }]}>
          <Pressable
            onPress={() =>
              setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
            }
            style={[styles.monthNavButton, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}
          >
            <FontAwesome name="chevron-left" size={12} color={palette.textMuted} />
          </Pressable>
          <Text style={[styles.monthLabel, { color: palette.textPrimary }]}>
            {monthAnchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <Pressable
            onPress={() =>
              setMonthAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
            }
            style={[styles.monthNavButton, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}
          >
            <FontAwesome name="chevron-right" size={12} color={palette.textMuted} />
          </Pressable>
        </View>

        <View style={styles.weekdayRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
            <View key={`${day}-${idx}`} style={styles.weekdaySlot}>
              <Text style={[styles.weekdayLabel, { color: palette.textMuted }]}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((cell) => (
            <View key={cell.date.toISOString()} style={styles.dayCellSlot}>
              <Pressable
                onPress={() => setSelectedDate(cell.date)}
                style={[
                  styles.dayCell,
                  {
                    backgroundColor: cell.isCurrentMonth ? palette.card : isDark ? '#1E1D1B' : '#F3F4F6',
                    borderColor: isDark ? '#292524' : '#F0EEEA',
                    opacity: cell.isCurrentMonth ? 1 : 0.75,
                  },
                  cell.isToday ? styles.dayCellToday : null,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    {
                      color: cell.isToday ? '#FFFFFF' : cell.isCurrentMonth ? palette.textPrimary : palette.textMuted,
                    },
                  ]}
                >
                  {cell.date.getDate()}
                </Text>
                <View style={styles.cellDotWrap}>
                  {cell.hasLog ? (
                    <View style={[styles.cellDot, { backgroundColor: cell.isToday ? '#FFFFFF' : '#1C1917' }]} />
                  ) : cell.hasSchedule ? (
                    <View style={[styles.cellDot, { backgroundColor: '#93C5FD' }]} />
                  ) : cell.hasCheckIn ? (
                    <View style={[styles.cellDot, { backgroundColor: '#10B981' }]} />
                  ) : null}
                </View>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.legendStack}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#1C1917' }]} />
            <Text style={[styles.legendText, { color: palette.textMuted }]}>Completed dose</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#93C5FD' }]} />
            <Text style={[styles.legendText, { color: palette.textMuted }]}>Scheduled</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.legendText, { color: palette.textMuted }]}>Check-in only</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={Boolean(selectedDate)}
        animationType="fade"
        onRequestClose={() => setSelectedDate(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedDate(null)} />
          <View style={[styles.modalCard, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>
                {selectedDate
                  ? selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Day Details'}
              </Text>
              <Pressable
                onPress={() => setSelectedDate(null)}
                style={[styles.modalCloseButton, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}
              >
                <FontAwesome name="close" size={14} color={palette.textMuted} />
              </Pressable>
            </View>
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalSectionLabel, { color: palette.textMuted }]}>Scheduled</Text>
              <View style={styles.modalListStack}>
                {selectedScheduled.length === 0 ? (
                  <Text style={[styles.emptyText, { color: palette.textMuted }]}>No scheduled protocols.</Text>
                ) : (
                  selectedScheduled.map((compound) => (
                    <Pressable
                      key={compound.id}
                      onPress={() => {
                        setSelectedDate(null);
                        router.push({ pathname: '/(tabs)/log', params: { compoundId: compound.id } });
                      }}
                      style={[styles.modalListCard, { borderColor: isDark ? '#292524' : '#F5F5F4' }]}
                    >
                      <View style={[styles.modalListIcon, { backgroundColor: '#DBEAFE' }]}>
                        <FontAwesome name="medkit" size={13} color="#1E3A8A" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.modalListTitle, { color: palette.textPrimary }]}>{compound.name}</Text>
                        <Text style={[styles.modalListSubtitle, { color: palette.textMuted }]}>
                          {compound.doseAmount ?? '--'} {compound.doseUnit}
                        </Text>
                      </View>
                      <FontAwesome name="chevron-right" size={11} color={palette.textMuted} />
                    </Pressable>
                  ))
                )}
              </View>

              <Text style={[styles.modalSectionLabel, { color: palette.textMuted, marginTop: 18 }]}>Logs</Text>
              <View style={styles.modalListStack}>
                {selectedLogs.length === 0 ? (
                  <Text style={[styles.emptyText, { color: palette.textMuted }]}>No logs recorded.</Text>
                ) : (
                  selectedLogs.map((log) => (
                    <Pressable
                      key={log.id}
                      onPress={() => {
                        setSelectedDate(null);
                        router.push({ pathname: '/(tabs)/log', params: { logId: log.id } });
                      }}
                      style={[styles.modalListCard, { borderColor: isDark ? '#292524' : '#F5F5F4' }]}
                    >
                      <View style={[styles.modalListIcon, { backgroundColor: '#DCFCE7' }]}>
                        <FontAwesome name="check" size={13} color="#166534" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.modalListTitle, { color: palette.textPrimary }]}>Log entry</Text>
                        <Text style={[styles.modalListSubtitle, { color: palette.textMuted }]}>
                          {new Date(log.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      <FontAwesome name="chevron-right" size={11} color={palette.textMuted} />
                    </Pressable>
                  ))
                )}
              </View>

              <Text style={[styles.modalSectionLabel, { color: palette.textMuted, marginTop: 18 }]}>Check-In</Text>
              <Pressable
                onPress={() => {
                  if (!selectedDate) return;
                  const date = toDateOnly(selectedDate);
                  setSelectedDate(null);
                  router.push({ pathname: '/check-in', params: { date } });
                }}
                style={[styles.modalListCard, { borderColor: isDark ? '#292524' : '#F5F5F4' }]}
              >
                <View style={[styles.modalListIcon, { backgroundColor: '#FDF4C4' }]}>
                  <FontAwesome name="line-chart" size={13} color="#854D0E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalListTitle, { color: palette.textPrimary }]}>
                    {selectedCheckIn ? 'Check-in recorded' : 'No check-in yet'}
                  </Text>
                  <Text style={[styles.modalListSubtitle, { color: palette.textMuted }]}>
                    {selectedCheckIn ? 'Tap to edit' : 'Tap to add check-in'}
                  </Text>
                </View>
                <FontAwesome name="chevron-right" size={11} color={palette.textMuted} />
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { gap: UI_LAYOUT.sectionGap },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  errorTitle: { fontSize: 18, fontWeight: '800' },
  errorBody: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSpacer: { width: 40 },

  monthCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10 }
      : {}),
  },
  monthNavButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: { fontSize: 16, fontWeight: '800' },

  weekdayRow: { flexDirection: 'row', paddingHorizontal: 2 },
  weekdaySlot: { width: '14.285714%', alignItems: 'center' },
  weekdayLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCellSlot: { width: '14.285714%', paddingHorizontal: 4, marginBottom: 8 },
  dayCell: {
    width: '100%',
    aspectRatio: 0.88,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dayCellToday: { backgroundColor: '#1C1917', borderColor: '#1C1917' },
  dayNumber: { fontSize: 14, fontWeight: '700' },
  cellDotWrap: { minHeight: 8, justifyContent: 'center' },
  cellDot: { width: 6, height: 6, borderRadius: 3 },

  legendStack: { gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontWeight: '600' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(28,25,23,0.3)',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 32,
    borderWidth: 1,
    padding: 20,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.12, shadowRadius: 40 }
      : {}),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 16, fontWeight: '800' },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginLeft: 2,
    marginBottom: 8,
  },
  modalListStack: { gap: 8 },
  modalListCard: {
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 60,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalListIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalListTitle: { fontSize: 14, fontWeight: '700' },
  modalListSubtitle: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  emptyText: { fontSize: 13, fontWeight: '600', paddingVertical: 6 },
});
