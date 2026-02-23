import React, { useEffect, useMemo, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import { Screen } from '@/components/Screen';
import { useColorScheme } from '@/components/useColorScheme';
import { useProfile } from '@/contexts/ProfileContext';
import { listCheckIns } from '@/services/repository';
import { UI_LAYOUT, getUiPalette } from '@/theme/ui';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import { lbToKg, type AestheticCheckIn } from '@dosebase/shared';

type MetricKey =
  | 'weight'
  | 'muscleFullness'
  | 'skinClarity'
  | 'skinTexture'
  | 'jawlineDefinition'
  | 'facialFullness'
  | 'inflammation'
  | 'energy'
  | 'sleepQuality'
  | 'libido';

type MetricDef = {
  key: MetricKey;
  label: string;
  group: 'Body Stats' | 'Aesthetics (1-10)' | 'Vitality (1-10)';
};

const METRICS: MetricDef[] = [
  { key: 'weight', label: 'Weight', group: 'Body Stats' },
  { key: 'muscleFullness', label: 'Muscle', group: 'Aesthetics (1-10)' },
  { key: 'skinClarity', label: 'Clarity', group: 'Aesthetics (1-10)' },
  { key: 'skinTexture', label: 'Texture', group: 'Aesthetics (1-10)' },
  { key: 'jawlineDefinition', label: 'Jawline', group: 'Aesthetics (1-10)' },
  { key: 'facialFullness', label: 'Face Bloat', group: 'Aesthetics (1-10)' },
  { key: 'inflammation', label: 'Inflammation', group: 'Aesthetics (1-10)' },
  { key: 'energy', label: 'Energy', group: 'Vitality (1-10)' },
  { key: 'sleepQuality', label: 'Sleep', group: 'Vitality (1-10)' },
  { key: 'libido', label: 'Libido', group: 'Vitality (1-10)' },
];

type TrendPoint = { label: string; value: number };

function toTrendValue(checkIn: AestheticCheckIn, metric: MetricKey, units: 'imperial' | 'metric') {
  if (metric === 'weight') {
    if (checkIn.weight === undefined || checkIn.weight === null) return null;
    return units === 'metric' ? lbToKg(checkIn.weight) : checkIn.weight;
  }
  return checkIn.metrics[metric];
}

function formatMetricValue(value: number, metric: MetricKey, units: 'imperial' | 'metric') {
  if (metric === 'weight') {
    return { display: value.toFixed(1), unit: units === 'metric' ? 'kg' : 'lbs' };
  }
  return { display: value.toFixed(1), unit: '/10' };
}

function formatDelta(delta: number, metric: MetricKey, units: 'imperial' | 'metric') {
  if (metric === 'weight') {
    return `${delta > 0 ? '+' : ''}${delta.toFixed(1)} ${units === 'metric' ? 'kg' : 'lbs'}`;
  }
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}`;
}

function buildSmoothCurve(
  nodes: Array<{ x: number; y: number; label: string }>,
  samplesPerSegment = 6
) {
  if (nodes.length <= 2) return nodes;

  const curve: Array<{ x: number; y: number; label: string }> = [nodes[0]];

  for (let idx = 0; idx < nodes.length - 1; idx += 1) {
    const p0 = nodes[Math.max(0, idx - 1)];
    const p1 = nodes[idx];
    const p2 = nodes[idx + 1];
    const p3 = nodes[Math.min(nodes.length - 1, idx + 2)];

    for (let sample = 1; sample <= samplesPerSegment; sample += 1) {
      const t = sample / samplesPerSegment;
      const t2 = t * t;
      const t3 = t2 * t;

      const x =
        0.5 *
        ((2 * p1.x) +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

      const y =
        0.5 *
        ((2 * p1.y) +
          (-p0.y + p2.y) * t +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

      curve.push({ x, y, label: p2.label });
    }
  }

  return curve;
}

export default function TrendsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = getUiPalette(isDark);
  const tabBarHeight = useTabBarHeight();
  const { profile } = useProfile();
  const units = profile?.units ?? 'imperial';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkIns, setCheckIns] = useState<AestheticCheckIn[]>([]);
  const [metric, setMetric] = useState<MetricKey>('weight');
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    listCheckIns({ limit: 90 })
      .then((data) => {
        if (!isMounted) return;
        setCheckIns(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load trends');
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const points = useMemo<TrendPoint[]>(() => {
    const sorted = [...checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted
      .map((item) => {
        const value = toTrendValue(item, metric, units);
        if (value === null) return null;
        return {
          label: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value,
        };
      })
      .filter((item): item is TrendPoint => item !== null)
      .slice(-7);
  }, [checkIns, metric, units]);

  const currentValue = points.length > 0 ? points[points.length - 1].value : null;
  const delta = points.length > 1 ? points[points.length - 1].value - points[0].value : null;
  const min = points.length > 0 ? Math.min(...points.map((p) => p.value)) : 0;
  const max = points.length > 0 ? Math.max(...points.map((p) => p.value)) : 0;
  const range = Math.max(max - min, metric === 'weight' ? 0.5 : 1);
  const chartGeometry = useMemo(() => {
    if (chartWidth <= 0 || points.length === 0) {
      return {
        nodes: [] as Array<{ x: number; y: number; label: string }>,
        curveNodes: [] as Array<{ x: number; y: number; label: string }>,
        segments: [] as Array<{ left: number; top: number; width: number; angle: number }>,
      };
    }

    const horizontalPadding = 8;
    const topPadding = 8;
    const plotHeight = 150;
    const baselineY = topPadding + plotHeight;
    const step = points.length > 1 ? (chartWidth - horizontalPadding * 2) / (points.length - 1) : 0;

    const nodes = points.map((point, idx) => {
      const normalized = range > 0 ? (point.value - min) / range : 0.5;
      const x = horizontalPadding + step * idx;
      const y = baselineY - normalized * plotHeight;
      return { x, y, label: point.label };
    });

    const curveNodes = buildSmoothCurve(nodes);

    const segments = curveNodes.slice(1).map((node, idx) => {
      const prev = curveNodes[idx];
      const dx = node.x - prev.x;
      const dy = node.y - prev.y;
      const overlap = 2.5;
      const width = Math.hypot(dx, dy) + overlap;
      const angle = Math.atan2(dy, dx);
      return {
        left: prev.x + dx / 2 - width / 2,
        top: prev.y + dy / 2 - 2,
        width,
        angle,
      };
    });

    return { nodes, curveNodes, segments };
  }, [chartWidth, points, min, range]);

  const currentMetricDef = METRICS.find((m) => m.key === metric);

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
          <Text style={[styles.errorTitle, { color: palette.textPrimary }]}>Trends unavailable</Text>
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

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ gap: 4 }}>
            <Text style={[styles.title, { color: palette.textPrimary }]}>Trends</Text>
            <Text style={[styles.subtitle, { color: palette.textMuted }]}>Track your journey</Text>
          </View>
          <Pressable
            style={[
              styles.logButton,
              Platform.OS === 'ios' && {
                shadowColor: '#1C1917',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
              },
            ]}
            onPress={() => router.push('/check-in')}
          >
            <FontAwesome name="plus" size={12} color="#FFFFFF" />
            <Text style={styles.logButtonText}>Log Entry</Text>
          </Pressable>
        </View>

        {/* Metric Selector Groups */}
        {(['Body Stats', 'Aesthetics (1-10)', 'Vitality (1-10)'] as const).map((group) => (
          <View key={group} style={{ gap: 10 }}>
            <Text style={[styles.groupLabel, { color: palette.textMuted }]}>{group}</Text>
            <View style={styles.metricRow}>
              {METRICS.filter((m) => m.group === group).map((item) => {
                const selected = metric === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => {
                      if (metric === item.key) return;
                      LayoutAnimation.configureNext({
                        duration: 280,
                        update: {
                          type: LayoutAnimation.Types.easeInEaseOut,
                        },
                      });
                      setMetric(item.key);
                    }}
                    style={[
                      styles.metricChip,
                      selected
                        ? [
                            styles.metricChipSelected,
                            Platform.OS === 'ios' && {
                              shadowColor: '#1C1917',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.2,
                              shadowRadius: 8,
                            },
                          ]
                        : {
                            backgroundColor: palette.card,
                            borderColor: isDark ? '#292524' : 'transparent',
                            borderWidth: 1,
                          },
                    ]}
                  >
                    <Text
                      style={[
                        styles.metricChipText,
                        { color: selected ? '#FFFFFF' : palette.textSecondary },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* Chart Card — rounded-[40px] */}
        <View
          style={[
            styles.chartCard,
            { backgroundColor: palette.card, borderColor: isDark ? '#292524' : '#FAFAF9' },
          ]}
        >
          {currentValue !== null ? (
            <>
              {/* Chart header: big value + delta badge */}
              <View style={styles.chartHeader}>
                <View style={{ gap: 6 }}>
                  <Text style={[styles.chartKicker, { color: palette.textMuted }]}>
                    {currentMetricDef?.label?.toUpperCase()}
                  </Text>
                  <View style={styles.valueRow}>
                    <Text style={[styles.chartValue, { color: palette.textPrimary }]}>
                      {formatMetricValue(currentValue, metric, units).display}
                    </Text>
                    <Text style={[styles.chartUnit, { color: palette.textMuted }]}>
                      {formatMetricValue(currentValue, metric, units).unit}
                    </Text>
                  </View>
                </View>
                {delta !== null ? (
                  <View
                    style={[
                      styles.deltaBadge,
                      {
                        borderColor: isDark ? '#292524' : '#F5F5F4',
                        backgroundColor: palette.card,
                      },
                    ]}
                  >
                    <FontAwesome
                      name={delta >= 0 ? 'arrow-up' : 'arrow-down'}
                      size={11}
                      color={delta >= 0 ? '#166534' : '#9F1239'}
                    />
                    <Text style={[styles.deltaText, { color: delta >= 0 ? '#166534' : '#9F1239' }]}>
                      {formatDelta(delta, metric, units)}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Line chart */}
              <View style={styles.chartGrid}>
                <View
                  style={styles.chartPlotArea}
                  onLayout={(event) => setChartWidth(event.nativeEvent.layout.width)}
                >
                  <View style={[styles.gridLine, { backgroundColor: isDark ? '#2A2826' : '#F0EEEA', top: 8 }]} />
                  <View style={[styles.gridLine, { backgroundColor: isDark ? '#2A2826' : '#F0EEEA', top: '38%' }]} />
                  <View style={[styles.gridLine, { backgroundColor: isDark ? '#2A2826' : '#F0EEEA', top: '74%' }]} />

                  {chartGeometry.segments.map((segment, idx) => (
                    <View
                      key={`segment-${idx}`}
                      style={[
                        styles.chartLineSegment,
                        {
                          left: segment.left,
                          top: segment.top,
                          width: segment.width,
                          transform: [{ rotateZ: `${segment.angle}rad` }],
                          backgroundColor: isDark ? '#E7E5E4' : '#1C1917',
                        },
                      ]}
                    />
                  ))}

                  {chartGeometry.nodes.map((node, idx) => {
                    const isLast = idx === chartGeometry.nodes.length - 1;
                    const lineColor = isDark ? '#E7E5E4' : '#1C1917';
                    return (
                      <View
                        key={`node-${node.label}-${idx}`}
                        style={[
                          styles.chartPoint,
                          {
                            left: node.x - (isLast ? 5 : 4),
                            top: node.y - (isLast ? 5 : 4),
                            backgroundColor: lineColor,
                          },
                          isLast ? styles.chartPointActive : null,
                        ]}
                      />
                    );
                  })}
                </View>

                <View style={styles.chartLabelsRow}>
                  {points.map((point, idx) => (
                    <Text key={`${point.label}-${idx}`} style={[styles.chartLabel, { color: palette.textMuted }]}>
                      {point.label}
                    </Text>
                  ))}
                </View>
              </View>
            </>
          ) : (
            /* Empty state */
            <View style={styles.emptyChart}>
              <View style={[styles.emptyChartIcon, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}>
                <FontAwesome name="area-chart" size={24} color={palette.textMuted} />
              </View>
              <Text style={[styles.emptyChartTitle, { color: palette.textPrimary }]}>No trend data yet</Text>
              <Text style={[styles.emptyChartBody, { color: palette.textMuted }]}>
                Log more entries to see your trend.
              </Text>
              <Pressable
                style={[styles.logEntryCTA, { backgroundColor: isDark ? '#292524' : '#F5F5F4' }]}
                onPress={() => router.push('/check-in')}
              >
                <FontAwesome name="plus" size={12} color={palette.textSecondary} />
                <Text style={[styles.logEntryCTAText, { color: palette.textSecondary }]}>
                  Log your first check-in
                </Text>
              </Pressable>
            </View>
          )}
        </View>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: { gap: UI_LAYOUT.sectionGap },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  errorTitle: { fontSize: 18, fontWeight: '800' },
  errorBody: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontWeight: '500' },
  logButton: {
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1917',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },

  // Metric selector
  groupLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginLeft: 2,
  },
  metricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricChip: {
    paddingHorizontal: 18,
    minHeight: 38,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 }
      : {}),
  },
  metricChipSelected: {
    backgroundColor: '#1C1917',
    borderColor: '#1C1917',
    borderWidth: 1,
  },
  metricChipText: { fontSize: 12, fontWeight: '700' },

  // Chart card
  chartCard: {
    borderWidth: 1,
    borderRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    minHeight: 400,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 12 }
      : {}),
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  chartKicker: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2 },
  valueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  chartValue: { fontSize: 50, fontWeight: '800', letterSpacing: -0.5, lineHeight: 54 },
  chartUnit: { fontSize: 18, fontWeight: '700', lineHeight: 28 },
  deltaBadge: {
    minHeight: 36,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...(Platform.OS === 'ios'
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 }
      : {}),
  },
  deltaText: { fontSize: 13, fontWeight: '700' },

  // Line chart
  chartGrid: {
    height: 220,
    borderRadius: 16,
    justifyContent: 'flex-end',
  },
  chartPlotArea: {
    height: 176,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  chartLineSegment: {
    position: 'absolute',
    height: 4,
    borderRadius: 999,
  },
  chartPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chartPointActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chartLabelsRow: {
    marginTop: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chartLabel: { fontSize: 9, fontWeight: '700', textAlign: 'center' },

  // Empty chart
  emptyChart: { flex: 1, minHeight: 300, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyChartIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  emptyChartTitle: { fontSize: 18, fontWeight: '700' },
  emptyChartBody: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  logEntryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 4,
  },
  logEntryCTAText: { fontSize: 13, fontWeight: '700' },
});
