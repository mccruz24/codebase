import React, { useEffect, useMemo, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useColorScheme } from '@/components/useColorScheme';
import { useProfile } from '@/contexts/ProfileContext';
import { listCheckIns, listCompounds, listInjectionLogs } from '@/services/repository';
import { UI_LAYOUT, getUiPalette } from '@/theme/ui';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import {
  formatWeight,
  getLogsOnDate,
  getScheduledCompounds,
  lbToKg,
  toDateOnly,
  type AestheticCheckIn,
  type Compound,
  type InjectionLog,
} from '@dosebase/shared';

type ScheduledItem = {
  compound: Compound;
  isCompleted: boolean;
  dose?: number;
  logId?: string;
};

type WeekItem = {
  day: string;
  date: number;
  fullDate: Date;
  hasLog: boolean;
  hasSchedule: boolean;
  isToday: boolean;
};

function getTimeGreeting(now: Date): { text: string; emoji: string } {
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good morning', emoji: '🌅' };
  if (hour >= 12 && hour < 17) return { text: 'Good afternoon', emoji: '🌞' };
  if (hour >= 17 && hour < 21) return { text: 'Good evening', emoji: '🌆' };
  return { text: 'Goodnight', emoji: '🌙' };
}

function getCompoundAccent(color?: string) {
  if (!color) return '#E2E8F0';
  const lookup: Record<string, string> = {
    'bg-blue-500': '#DBEAFE',
    'bg-sky-500': '#E0F2FE',
    'bg-cyan-500': '#CFFAFE',
    'bg-teal-500': '#CCFBF1',
    'bg-emerald-500': '#D1FAE5',
    'bg-green-500': '#DCFCE7',
    'bg-lime-500': '#ECFCCB',
    'bg-yellow-500': '#FEF9C3',
    'bg-amber-500': '#FEF3C7',
    'bg-orange-500': '#FFEDD5',
    'bg-red-500': '#FEE2E2',
    'bg-rose-500': '#FFE4E6',
    'bg-pink-500': '#FCE7F3',
    'bg-fuchsia-500': '#FAE8FF',
    'bg-purple-500': '#F3E8FF',
    'bg-violet-500': '#EDE9FE',
    'bg-indigo-500': '#E0E7FF',
  };
  return lookup[color] ?? '#E2E8F0';
}

function getCompoundSolidColor(color?: string) {
  if (!color) return '#94A3B8';
  const lookup: Record<string, string> = {
    'bg-blue-500': '#3B82F6',
    'bg-sky-500': '#0EA5E9',
    'bg-teal-500': '#14B8A6',
    'bg-emerald-500': '#10B981',
    'bg-red-500': '#EF4444',
    'bg-rose-500': '#F43F5E',
    'bg-pink-500': '#EC4899',
    'bg-purple-500': '#A855F7',
    'bg-indigo-500': '#6366F1',
  };
  return lookup[color] ?? '#6366F1';
}

function formatUpcomingDate(value: Date) {
  return value.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatLogDateTime(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HomeScreen() {
  const { profile } = useProfile();
  const units = profile?.units ?? 'imperial';
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = getUiPalette(isDark);
  const tabBarHeight = useTabBarHeight();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduledToday, setScheduledToday] = useState<ScheduledItem[]>([]);
  const [progress, setProgress] = useState(0);
  const [weekView, setWeekView] = useState<WeekItem[]>([]);
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [injections, setInjections] = useState<InjectionLog[]>([]);
  const [checkIns, setCheckIns] = useState<AestheticCheckIn[]>([]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDayDetails, setSelectedDayDetails] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      const [allCompounds, allInjections, allCheckIns] = await Promise.all([
        listCompounds({ includeArchived: true }),
        listInjectionLogs({ limit: 1000 }),
        listCheckIns({ limit: 366 }),
      ]);
      if (!isMounted) return;

      const activeCompounds = allCompounds.filter((compound) => !compound.isArchived);
      setCompounds(activeCompounds);
      setInjections(allInjections);
      setCheckIns(allCheckIns);

      const now = new Date();
      const dueToday = getScheduledCompounds(activeCompounds, now);
      const logsToday = getLogsOnDate(allInjections, now);
      const todayItems: ScheduledItem[] = dueToday.map((compound) => {
        const completedLog = logsToday.find((log) => log.compoundId === compound.id);
        return {
          compound,
          isCompleted: Boolean(completedLog),
          logId: completedLog?.id,
          dose: completedLog?.dose ?? compound.doseAmount,
        };
      });
      setScheduledToday(todayItems);

      const completed = todayItems.filter((item) => item.isCompleted).length;
      setProgress(todayItems.length > 0 ? Math.round((completed / todayItems.length) * 100) : 0);

      const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      const nextWeek: WeekItem[] = [];
      for (let idx = -3; idx <= 3; idx += 1) {
        const date = new Date(now);
        date.setDate(now.getDate() + idx);
        nextWeek.push({
          day: weekdays[date.getDay()],
          date: date.getDate(),
          fullDate: new Date(date),
          hasLog: getLogsOnDate(allInjections, date).length > 0,
          hasSchedule: getScheduledCompounds(activeCompounds, date).length > 0,
          isToday: idx === 0,
        });
      }
      setWeekView(nextWeek);
    };

    run()
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const now = new Date();
  const greeting = getTimeGreeting(now);
  const hasPending = scheduledToday.some((item) => !item.isCompleted);
  const nextPending = scheduledToday.find((item) => !item.isCompleted) ?? null;

  const currentWeight = checkIns.length > 0 ? checkIns[0].weight : null;
  const displayedWeight =
    currentWeight === null || currentWeight === undefined ? null : formatWeight(currentWeight, units);
  const rawWeightDelta =
    checkIns.length > 1 && checkIns[0].weight !== undefined && checkIns[1].weight !== undefined
      ? checkIns[0].weight - checkIns[1].weight
      : null;
  const displayedWeightDelta =
    rawWeightDelta === null ? null : units === 'metric' ? lbToKg(rawWeightDelta) : rawWeightDelta;

  const searchableLogs = useMemo(() => {
    const map = new Map(compounds.map((compound) => [compound.id, compound]));
    return injections
      .slice(0, 200)
      .map((log) => ({ log, compound: map.get(log.compoundId) }))
      .filter((item) => Boolean(item.compound));
  }, [compounds, injections]);

  const filteredCompounds = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return compounds.slice(0, 10);
    return compounds.filter((compound) => compound.name.toLowerCase().includes(normalized)).slice(0, 10);
  }, [compounds, searchQuery]);

  const filteredLogs = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return searchableLogs.slice(0, 15);
    return searchableLogs
      .filter((item) => item.compound?.name.toLowerCase().includes(normalized))
      .slice(0, 15);
  }, [searchQuery, searchableLogs]);

  const upcoming = useMemo(() => {
    const items: { date: Date; compound: Compound; done: boolean }[] = [];
    const today = new Date();
    for (let offset = 0; offset <= 7; offset += 1) {
      const target = new Date(today);
      target.setDate(today.getDate() + offset);
      const due = getScheduledCompounds(compounds, target);
      if (due.length === 0) continue;
      const logsOnDate = getLogsOnDate(injections, target);
      for (const compound of due) {
        items.push({
          date: target,
          compound,
          done: logsOnDate.some((log) => log.compoundId === compound.id),
        });
      }
    }
    return items;
  }, [compounds, injections]);

  const upNextDay = useMemo(() => {
    if (upcoming.length === 0) {
      return { label: null as string | null, items: [] as typeof upcoming };
    }

    const todayKey = toDateOnly(new Date());
    const futureOnly = upcoming.filter((item) => toDateOnly(item.date) !== todayKey);
    if (futureOnly.length === 0) {
      return { label: null as string | null, items: [] as typeof upcoming };
    }

    const grouped = new Map<string, { date: Date; items: typeof upcoming }>();
    for (const item of futureOnly) {
      const key = toDateOnly(item.date);
      const existing = grouped.get(key);
      if (existing) {
        existing.items.push(item);
      } else {
        grouped.set(key, { date: item.date, items: [item] });
      }
    }

    const ordered = Array.from(grouped.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
    const selected = ordered[0];

    return { label: formatUpcomingDate(selected.date), items: selected.items };
  }, [upcoming]);

  const selectedDayScheduled = useMemo(
    () => (selectedDayDetails ? getScheduledCompounds(compounds, selectedDayDetails) : []),
    [compounds, selectedDayDetails]
  );
  const selectedDayLogs = useMemo(
    () => (selectedDayDetails ? getLogsOnDate(injections, selectedDayDetails) : []),
    [injections, selectedDayDetails]
  );
  const selectedDayCheckIn = useMemo(() => {
    if (!selectedDayDetails) return null;
    const dateOnly = toDateOnly(selectedDayDetails);
    return checkIns.find((checkIn) => checkIn.date === dateOnly) ?? null;
  }, [checkIns, selectedDayDetails]);

  if (loading) {
    return (
      <Screen>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: UI_LAYOUT.tabPageTopPadding, paddingBottom: tabBarHeight },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Skeleton header */}
          <View style={styles.skeletonHeaderRow}>
            <View style={styles.skeletonHeaderLeft}>
              <View style={[styles.skeletonAvatar, { backgroundColor: isDark ? '#2A2826' : '#ECE9E4' }]} />
              <View style={[styles.skeletonGreeting, { backgroundColor: isDark ? '#2A2826' : '#ECE9E4' }]} />
            </View>
            <View style={styles.skeletonActions}>
              <View style={[styles.skeletonActionCircle, { backgroundColor: isDark ? '#2A2826' : '#ECE9E4' }]} />
              <View style={[styles.skeletonActionCircle, { backgroundColor: isDark ? '#2A2826' : '#ECE9E4' }]} />
            </View>
          </View>
          <View style={[styles.skeletonHero, { backgroundColor: isDark ? '#1E2C3A' : '#E6EEF6' }]} />
          <View style={[styles.skeletonWeek, { backgroundColor: isDark ? '#2A2826' : '#F0EEEA' }]} />
          <View style={styles.skeletonStatsRow}>
            <View style={[styles.skeletonStatCard, { backgroundColor: isDark ? '#2A2826' : '#F0EEEA' }]} />
            <View style={[styles.skeletonStatCard, { backgroundColor: isDark ? '#2A2826' : '#F0EEEA' }]} />
          </View>
          <View style={[styles.skeletonListItem, { backgroundColor: isDark ? '#2A2826' : '#F0EEEA' }]} />
          <View style={[styles.skeletonListItem, { backgroundColor: isDark ? '#2A2826' : '#F0EEEA' }]} />
        </ScrollView>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.centerWrap}>
          <Text style={[styles.errorTitle, { color: palette.textPrimary }]}>Dashboard unavailable</Text>
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
            { paddingTop: UI_LAYOUT.tabPageTopPadding, paddingBottom: tabBarHeight },
          ]}
          showsVerticalScrollIndicator={false}
        >
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { borderColor: isDark ? '#292524' : '#FFFFFF' }]}>
              <Text style={styles.avatarText}>ME</Text>
            </View>
            <Text style={[styles.greetingText, { color: palette.textPrimary }]}>
              {greeting.text} {greeting.emoji}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setSearchOpen(true)}
              style={[styles.roundAction, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' }]}
            >
              <FontAwesome name="search" size={15} color={palette.textMuted} />
            </Pressable>
            <Pressable
              onPress={() => setInboxOpen(true)}
              style={[styles.roundAction, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' }]}
            >
              <FontAwesome name="bell-o" size={15} color={palette.textMuted} />
              {hasPending ? <View style={styles.bellDot} /> : null}
            </Pressable>
          </View>
        </View>

        {/* Hero Progress Card — bg-pastel-blue */}
        <View style={styles.progressCard}>
          <View style={styles.heroBlobLarge} />
          <View style={styles.heroBlobSmall} />
          <View style={styles.progressCardInner}>
            <View style={styles.progressTopRow}>
              <View>
                <View style={styles.progressLabelRow}>
                  <FontAwesome name="heartbeat" size={13} color="#57534E" />
                  <Text style={styles.progressLabel}>YOUR PROGRESS</Text>
                </View>
                <Text style={styles.progressValue}>{progress}%</Text>
              </View>
              <View style={styles.progressDatePill}>
                <Text style={styles.progressDateText}>
                  {now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
            </View>
          </View>
        </View>

        {/* 7-Day Calendar Strip */}
        <View>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Week Days</Text>
            <Pressable
              onPress={() => router.push('/calendar')}
              style={[styles.calendarAction, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' }]}
            >
              <FontAwesome name="calendar-o" size={14} color={palette.textMuted} />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekRow}>
            {weekView.map((day) => (
              <Pressable
                key={`${day.day}-${day.date}`}
                onPress={() => setSelectedDayDetails(day.fullDate)}
                style={[
                  styles.weekItem,
                  day.isToday
                    ? [styles.weekItemToday, Platform.OS === 'ios' && {
                        shadowColor: '#1C1917',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.2,
                        shadowRadius: 16,
                      }]
                    : {
                        backgroundColor: palette.card,
                        borderColor: 'transparent',
                        borderWidth: 1,
                      },
                ]}
              >
                <Text style={[styles.weekDayLabel, { color: day.isToday ? '#FFFFFF' : palette.textMuted }]}>
                  {day.day}
                </Text>
                <View
                  style={[
                    styles.weekDateCircle,
                    day.isToday
                      ? { backgroundColor: '#292524' }
                      : { backgroundColor: isDark ? '#292524' : '#F5F5F4' },
                  ]}
                >
                  <Text style={[
                    styles.weekDateText,
                    { color: day.isToday ? '#FFFFFF' : palette.textPrimary },
                  ]}>
                    {day.date}
                  </Text>
                </View>
                <View style={styles.weekDotWrap}>
                  {day.hasLog ? (
                    <View style={[styles.activityDot, { backgroundColor: day.isToday ? '#FFFFFF' : '#1C1917' }]} />
                  ) : day.hasSchedule ? (
                    <View style={[styles.activityDot, { backgroundColor: '#D6D3D1' }]} />
                  ) : null}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          {/* Weight Card */}
          <Pressable
            onPress={() => router.push('/check-in')}
            style={[styles.statCard, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#FAFAF9' }]}
          >
            {/* Corner decoration — pastel-green */}
            <View style={[styles.statDecoration, {
              backgroundColor: isDark ? 'rgba(205,245,227,0.08)' : 'rgba(205,245,227,0.4)',
            }]} />
            <View style={styles.statTopRow}>
              <Text style={[styles.statKicker, { color: palette.textMuted }]}>WEIGHT</Text>
              <View style={[styles.statIconBadge, { backgroundColor: '#CDF5E3' }]}>
                <FontAwesome name="balance-scale" size={13} color="#44403C" />
              </View>
            </View>
            <Text style={[styles.weightValue, { color: palette.textPrimary }]}>
              {displayedWeight ? displayedWeight.value.toFixed(1) : '--'}
              <Text style={[styles.weightUnit, { color: palette.textMuted }]}>
                {' '}{displayedWeight ? displayedWeight.unit : units === 'metric' ? 'kg' : 'lbs'}
              </Text>
            </Text>
            {displayedWeightDelta !== null ? (
              <View style={styles.weightDeltaRow}>
                <View style={[styles.weightDeltaBadge, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}>
                  <Text style={[styles.weightDeltaText, { color: palette.textSecondary }]}>
                    {displayedWeightDelta > 0 ? '+' : ''}{displayedWeightDelta.toFixed(1)}
                  </Text>
                </View>
                <Text style={[styles.weightSinceText, { color: palette.textMuted }]}>Since last</Text>
              </View>
            ) : null}
          </Pressable>

          {/* Up Next Card */}
          <View style={[styles.statCard, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#FAFAF9' }]}>
            {/* Corner decoration — pastel-yellow */}
            <View style={[styles.statDecoration, {
              backgroundColor: isDark ? 'rgba(253,244,196,0.06)' : 'rgba(253,244,196,0.5)',
            }]} />
            <View style={styles.statTopRow}>
              <Text style={[styles.statKicker, { color: palette.textMuted }]}>UP NEXT</Text>
              <View style={[styles.statIconBadge, { backgroundColor: '#FDF4C4' }]}>
                <FontAwesome name="eyedropper" size={13} color="#44403C" />
              </View>
            </View>
            {upNextDay.items.length === 0 ? (
              <>
                <Text style={[styles.nextFallbackTitle, { color: palette.textMuted }]}>Rest Day</Text>
                <Text style={[styles.nextFallbackSubtitle, { color: palette.textSecondary }]}>No dose due</Text>
              </>
            ) : (
              <View style={styles.upNextChecklist}>
                <Text style={[styles.upNextDayLabel, { color: palette.textSecondary }]}>{upNextDay.label}</Text>
                {upNextDay.items.map((item, idx) => (
                  <View key={`${item.compound.id}-${idx}`} style={styles.upNextChecklistItem}>
                    <View
                      style={[
                        styles.upNextCheckIcon,
                        item.done
                          ? { backgroundColor: '#CDF5E3', borderColor: '#A7F3D0' }
                          : { backgroundColor: 'transparent', borderColor: isDark ? '#57534E' : '#D6D3D1' },
                      ]}
                    >
                      {item.done ? <FontAwesome name="check" size={9} color="#166534" /> : null}
                    </View>
                    <View style={styles.upNextTextWrap}>
                      <Text numberOfLines={1} style={[styles.upNextItemTitle, { color: palette.textPrimary }]}>
                        {item.compound.name}
                      </Text>
                      {item.done ? (
                        <Text numberOfLines={1} style={[styles.upNextItemMeta, { color: palette.textSecondary }]}>
                          Done
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Today's Protocol Section */}
        <View>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Today's Protocol</Text>
          </View>
          <View style={styles.protocolStack}>
            {scheduledToday.length === 0 ? (
              <View style={[styles.protocolEmpty, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' }]}>
                <View style={[styles.protocolEmptyIcon, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}>
                  <FontAwesome name="moon-o" size={18} color={palette.textMuted} />
                </View>
                <Text style={[styles.protocolEmptyTitle, { color: palette.textPrimary }]}>Rest & Recovery</Text>
                <Text style={[styles.protocolEmptyBody, { color: palette.textMuted }]}>No doses scheduled for today</Text>
              </View>
            ) : (
              scheduledToday.map((item, index) => (
                <Pressable
                  key={item.compound.id}
                  onPress={() =>
                    !item.isCompleted &&
                    router.push({
                      pathname: '/(tabs)/log',
                      params: { compoundId: item.compound.id },
                    })
                  }
                  style={[
                    styles.protocolCard,
                    item.isCompleted
                      ? {
                          backgroundColor: isDark ? '#1E1D1B' : '#F6F7F9',
                          opacity: 0.62,
                        }
                      : {
                          backgroundColor: palette.card,
                          borderColor: isDark ? '#292524' : '#FAFAF9',
                          borderWidth: 1,
                          ...(Platform.OS === 'ios'
                            ? {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.04,
                                shadowRadius: 14,
                              }
                            : {}),
                        },
                  ]}
                >
                  <View style={styles.protocolLeft}>
                    {/* Icon square with compound accent color */}
                    <View
                      style={[
                        styles.protocolIconWrap,
                        {
                          backgroundColor: item.isCompleted
                            ? isDark ? '#292524' : '#E7E5E4'
                            : getCompoundAccent(item.compound.color),
                        },
                      ]}
                    >
                      <FontAwesome
                        name={item.isCompleted ? 'check' : 'medkit'}
                        size={14}
                        color={item.isCompleted ? (isDark ? '#78716C' : '#78716C') : '#44403C'}
                      />
                    </View>
                    <View style={{ gap: 3, flexShrink: 1 }}>
                      <Text
                        style={[
                          styles.protocolName,
                          {
                            color: item.isCompleted ? palette.textMuted : palette.textPrimary,
                            textDecorationLine: item.isCompleted ? 'line-through' : 'none',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {item.compound.name}
                      </Text>
                      <Text style={[styles.protocolDose, { color: palette.textSecondary }]}>
                        {item.dose ?? item.compound.doseAmount ?? '--'} {item.compound.doseUnit}
                      </Text>
                    </View>
                  </View>
                  {!item.isCompleted ? (
                    <View style={[styles.protocolChevronCircle, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}>
                      <FontAwesome name="chevron-right" size={11} color={palette.textMuted} />
                    </View>
                  ) : null}
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Day Details Modal */}
      <Modal
        transparent
        visible={Boolean(selectedDayDetails)}
        animationType="fade"
        onRequestClose={() => setSelectedDayDetails(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedDayDetails(null)} />
          <View style={[styles.modalCard, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>
                {selectedDayDetails
                  ? selectedDayDetails.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Day Details'}
              </Text>
              <Pressable
                onPress={() => setSelectedDayDetails(null)}
                style={[styles.modalCloseButton, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}
              >
                <FontAwesome name="close" size={14} color={palette.textMuted} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalSectionLabel, { color: palette.textMuted }]}>Scheduled</Text>
              <View style={styles.modalListStack}>
                {selectedDayScheduled.length === 0 ? (
                  <Text style={[styles.emptyModalText, { color: palette.textMuted }]}>No scheduled protocols.</Text>
                ) : (
                  selectedDayScheduled.map((compound) => (
                    <Pressable
                      key={compound.id}
                      onPress={() => {
                        setSelectedDayDetails(null);
                        router.push({ pathname: '/(tabs)/log', params: { compoundId: compound.id } });
                      }}
                      style={[styles.modalListCard, { borderColor: isDark ? '#292524' : '#F5F5F4' }]}
                    >
                      <View style={[styles.modalListIcon, { backgroundColor: getCompoundAccent(compound.color) }]}>
                        <FontAwesome name="medkit" size={13} color="#44403C" />
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

              <Text style={[styles.modalSectionLabel, { color: palette.textMuted, marginTop: 18 }]}>Logged Entries</Text>
              <View style={styles.modalListStack}>
                {selectedDayLogs.length === 0 ? (
                  <Text style={[styles.emptyModalText, { color: palette.textMuted }]}>No logs recorded.</Text>
                ) : (
                  selectedDayLogs.map((log) => {
                    const compound = compounds.find((item) => item.id === log.compoundId);
                    return (
                      <Pressable
                        key={log.id}
                        onPress={() => {
                          setSelectedDayDetails(null);
                          router.push({ pathname: '/(tabs)/log', params: { logId: log.id } });
                        }}
                        style={[styles.modalListCard, { borderColor: isDark ? '#292524' : '#F5F5F4' }]}
                      >
                        <View style={[styles.modalListIcon, { backgroundColor: getCompoundAccent(compound?.color) }]}>
                          <FontAwesome name="check" size={13} color="#44403C" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.modalListTitle, { color: palette.textPrimary }]}>
                            {compound?.name ?? 'Unknown protocol'}
                          </Text>
                          <Text style={[styles.modalListSubtitle, { color: palette.textMuted }]}>
                            {log.dose} {compound?.doseUnit ?? ''} ·{' '}
                            {new Date(log.timestamp).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        <FontAwesome name="chevron-right" size={11} color={palette.textMuted} />
                      </Pressable>
                    );
                  })
                )}
              </View>

              <Text style={[styles.modalSectionLabel, { color: palette.textMuted, marginTop: 18 }]}>Check-In</Text>
              <View style={styles.modalListStack}>
                <Pressable
                  onPress={() => {
                    if (!selectedDayDetails) return;
                    const date = toDateOnly(selectedDayDetails);
                    setSelectedDayDetails(null);
                    router.push({ pathname: '/check-in', params: { date } });
                  }}
                  style={[styles.modalListCard, { borderColor: isDark ? '#292524' : '#F5F5F4' }]}
                >
                  <View style={[styles.modalListIcon, { backgroundColor: '#CDF5E3' }]}>
                    <FontAwesome name="line-chart" size={13} color="#166534" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalListTitle, { color: palette.textPrimary }]}>
                      {selectedDayCheckIn ? 'Check-in recorded' : 'No check-in yet'}
                    </Text>
                    <Text style={[styles.modalListSubtitle, { color: palette.textMuted }]}>
                      {selectedDayCheckIn ? 'Tap to edit this day' : 'Tap to add check-in'}
                    </Text>
                  </View>
                  <FontAwesome name="chevron-right" size={11} color={palette.textMuted} />
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Search Modal */}
      <Modal transparent visible={searchOpen} animationType="fade" onRequestClose={() => setSearchOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSearchOpen(false)} />
          <View style={[styles.modalCard, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>Search</Text>
              <Pressable
                onPress={() => setSearchOpen(false)}
                style={[styles.modalCloseButton, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}
              >
                <FontAwesome name="close" size={14} color={palette.textMuted} />
              </Pressable>
            </View>

            <View style={[styles.searchInputWrap, { backgroundColor: isDark ? '#292524' : '#F5F5F4', borderColor: isDark ? '#292524' : '#E7E5E4' }]}>
              <FontAwesome name="search" size={14} color={palette.textMuted} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: palette.textPrimary }]}
                placeholder="Search protocols or logs…"
                placeholderTextColor={palette.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalSectionLabel, { color: palette.textMuted }]}>Protocols</Text>
              <View style={styles.modalListStack}>
                {filteredCompounds.length === 0 ? (
                  <Text style={[styles.emptyModalText, { color: palette.textMuted }]}>No protocols found.</Text>
                ) : (
                  filteredCompounds.map((compound) => (
                    <Pressable
                      key={compound.id}
                      onPress={() => {
                        setSearchOpen(false);
                        router.push({ pathname: '/(tabs)/log', params: { compoundId: compound.id } });
                      }}
                      style={[styles.modalListCard, { borderColor: isDark ? '#292524' : '#F5F5F4' }]}
                    >
                      <View style={[styles.modalListIcon, { backgroundColor: getCompoundAccent(compound.color) }]}>
                        <FontAwesome name="medkit" size={13} color="#44403C" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.modalListTitle, { color: palette.textPrimary }]}>{compound.name}</Text>
                        <Text style={[styles.modalListSubtitle, { color: palette.textMuted }]}>Tap to log</Text>
                      </View>
                      <FontAwesome name="chevron-right" size={11} color={palette.textMuted} />
                    </Pressable>
                  ))
                )}
              </View>

              <Text style={[styles.modalSectionLabel, { color: palette.textMuted, marginTop: 18 }]}>Recent Logs</Text>
              <View style={styles.modalListStack}>
                {filteredLogs.length === 0 ? (
                  <Text style={[styles.emptyModalText, { color: palette.textMuted }]}>No logs found.</Text>
                ) : (
                  filteredLogs.map(({ log, compound }) => (
                    <Pressable
                      key={log.id}
                      onPress={() => {
                        setSearchOpen(false);
                        router.push({ pathname: '/(tabs)/log', params: { logId: log.id } });
                      }}
                      style={[styles.modalListCard, { borderColor: isDark ? '#292524' : '#F5F5F4' }]}
                    >
                      <View style={[styles.modalListIcon, { backgroundColor: getCompoundAccent(compound?.color) }]}>
                        <FontAwesome name="check" size={13} color="#44403C" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.modalListTitle, { color: palette.textPrimary }]}>
                          {compound?.name ?? 'Unknown protocol'}
                        </Text>
                        <Text style={[styles.modalListSubtitle, { color: palette.textMuted }]}>
                          {formatLogDateTime(log.timestamp)}
                        </Text>
                      </View>
                      <FontAwesome name="chevron-right" size={11} color={palette.textMuted} />
                    </Pressable>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Inbox Modal */}
      <Modal transparent visible={inboxOpen} animationType="fade" onRequestClose={() => setInboxOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setInboxOpen(false)} />
          <View style={[styles.modalCard, { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#F5F5F4' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>Upcoming</Text>
              <Pressable
                onPress={() => setInboxOpen(false)}
                style={[styles.modalCloseButton, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}
              >
                <FontAwesome name="close" size={14} color={palette.textMuted} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalListStack}>
                {upcoming.length === 0 ? (
                  <View style={[styles.inboxEmptyCard, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}>
                    <Text style={[styles.emptyModalText, { color: palette.textMuted }]}>No scheduled items.</Text>
                  </View>
                ) : (
                  upcoming.map((item, idx) => (
                    <Pressable
                      key={`${item.compound.id}-${idx}`}
                      onPress={() => {
                        setInboxOpen(false);
                        router.push({ pathname: '/(tabs)/log', params: { compoundId: item.compound.id } });
                      }}
                      style={[styles.modalListCard, { borderColor: isDark ? '#292524' : '#F5F5F4' }]}
                    >
                      <View style={[styles.modalListIcon, { backgroundColor: getCompoundAccent(item.compound.color) }]}>
                        <FontAwesome name="medkit" size={13} color="#44403C" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.modalListTitle, { color: palette.textPrimary }]}>{item.compound.name}</Text>
                        <Text style={[styles.modalListSubtitle, { color: palette.textMuted }]}>
                          {formatUpcomingDate(item.date)}
                          {item.done ? ' · Completed' : ''}
                        </Text>
                      </View>
                      {item.done ? (
                        <View style={[styles.doneBadge, { backgroundColor: '#CDF5E3' }]}>
                          <FontAwesome name="check" size={10} color="#166534" />
                        </View>
                      ) : (
                        <FontAwesome name="chevron-right" size={11} color={palette.textMuted} />
                      )}
                    </Pressable>
                  ))
                )}
              </View>
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
  errorTitle: { fontSize: 18, fontWeight: '700' },
  errorBody: { fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18 },

  // Skeleton
  skeletonHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skeletonHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  skeletonAvatar: { width: 40, height: 40, borderRadius: 20 },
  skeletonGreeting: { width: 180, height: 20, borderRadius: 8 },
  skeletonActions: { flexDirection: 'row', gap: 8 },
  skeletonActionCircle: { width: 40, height: 40, borderRadius: 20 },
  skeletonHero: { height: 160, borderRadius: 28 },
  skeletonWeek: { height: 128, borderRadius: 24 },
  skeletonStatsRow: { flexDirection: 'row', gap: 12 },
  skeletonStatCard: { flex: 1, height: 150, borderRadius: 28 },
  skeletonListItem: { height: 80, borderRadius: 24 },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDF4C4',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#1C1917', fontSize: 13, fontWeight: '800' },
  greetingText: { fontSize: 20, fontWeight: '700', letterSpacing: -0.1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  roundAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#F87171',
  },

  // Progress Card — pastel-blue bg
  progressCard: {
    backgroundColor: '#CBE4F9',
    borderRadius: 28,
    padding: 20,
    overflow: 'hidden',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 }
      : {}),
  },
  progressCardInner: { gap: 14 },
  progressTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  progressLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  progressLabel: {
    color: '#57534E',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  progressValue: { color: '#1C1917', fontSize: 36, fontWeight: '800', lineHeight: 42 },
  progressDatePill: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  progressDateText: { color: '#78716C', fontSize: 12, fontWeight: '700' },
  progressTrack: {
    height: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.4)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#1C1917',
  },
  heroBlobLarge: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    right: -42,
    bottom: -56,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  heroBlobSmall: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    right: 4,
    top: -12,
    backgroundColor: 'rgba(96,165,250,0.12)',
  },

  // Section header
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  calendarAction: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Week strip
  weekRow: { gap: 8, paddingRight: 8, paddingVertical: 4 },
  weekItem: {
    minWidth: 52,
    height: 112,
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekItemToday: {
    backgroundColor: '#1C1917',
  },
  weekDayLabel: { fontSize: 12, fontWeight: '500' },
  weekDateCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDateText: { fontSize: 14, fontWeight: '700' },
  weekDotWrap: { minHeight: 8, justifyContent: 'center', alignItems: 'center' },
  activityDot: { width: 6, height: 6, borderRadius: 3 },

  // Stats grid
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    minHeight: 150,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    overflow: 'hidden',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 10 }
      : {}),
  },
  statDecoration: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: '55%',
    height: '60%',
    borderTopLeftRadius: 40,
  },
  statTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statKicker: { fontSize: 12, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  statIconBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  weightValue: { fontSize: 36, fontWeight: '800', lineHeight: 40 },
  weightUnit: { fontSize: 16, fontWeight: '700' },
  weightDeltaRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  weightDeltaBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
    overflow: 'hidden',
  },
  weightDeltaText: { fontSize: 12, fontWeight: '700' },
  weightSinceText: { fontSize: 12, fontWeight: '500' },
  nextFallbackTitle: { fontSize: 28, fontWeight: '800', lineHeight: 32 },
  nextFallbackSubtitle: { marginTop: 4, fontSize: 13, fontWeight: '600' },
  upNextChecklist: { gap: 8, marginTop: 2 },
  upNextDayLabel: { fontSize: 11, fontWeight: '700' },
  upNextChecklistItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  upNextCheckIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upNextTextWrap: { flex: 1, gap: 1 },
  upNextItemTitle: { fontSize: 15, fontWeight: '700' },
  upNextItemMeta: { fontSize: 11, fontWeight: '600' },

  // Today's protocol
  protocolStack: { gap: 10 },
  protocolEmpty: {
    borderRadius: 28,
    borderWidth: 1,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  protocolEmptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolEmptyTitle: { fontSize: 16, fontWeight: '700' },
  protocolEmptyBody: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  protocolCard: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  protocolLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  protocolIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolName: { fontSize: 17, fontWeight: '700' },
  protocolDose: { fontSize: 13, fontWeight: '600' },
  protocolChevronCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modals
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
  searchInputWrap: {
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 46,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600' },
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
  emptyModalText: { fontSize: 13, fontWeight: '600', paddingVertical: 6 },
  inboxEmptyCard: {
    borderRadius: 20,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
