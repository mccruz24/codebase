import React, { useMemo, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Screen } from '@/components/Screen';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { UI_LAYOUT, getUiPalette } from '@/theme/ui';
import { useTabBarHeight } from '@/hooks/useTabBarHeight';
import {
  clearUserData,
  exportUserData,
  importUserData,
  seedDemoData,
} from '@/services/repository';

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const { profile, update } = useProfile();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const palette = useMemo(() => getUiPalette(isDark), [isDark]);
  const tabBarHeight = useTabBarHeight();

  const isTestAccount = (user?.email ?? '').toLowerCase() === 'test@test.com';
  const isPro = profile?.plan === 'pro';

  // Colors
  const cardBg = palette.card;
  const cardBorder = palette.cardBorder;
  const fieldBg = palette.field;
  const textPrimary = palette.textPrimary;
  const textMuted = palette.textMuted;

  // ── Handlers ────────────────────────────────────────────────────

  const onSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      router.replace('/(auth)/sign-in');
    } finally {
      setLoading(false);
    }
  };

  const setTheme = async (theme: 'system' | 'light' | 'dark') => {
    if (!profile) return;
    setSaving(true);
    try {
      await update({ theme });
    } finally {
      setSaving(false);
    }
  };

  const setUnits = async (units: 'imperial' | 'metric') => {
    if (!profile) return;
    setSaving(true);
    try {
      await update({ units });
    } finally {
      setSaving(false);
    }
  };

  const toggleNotify = async (key: 'notify_push' | 'notify_reminders') => {
    if (!profile) return;

    if (key === 'notify_push') {
      const next = !profile.notify_push;
      setSaving(true);
      try {
        // When disabling push, also disable reminders
        await update({
          notify_push: next,
          notify_reminders: next ? profile.notify_reminders : false,
        });
      } finally {
        setSaving(false);
      }
      return;
    }

    if (key === 'notify_reminders') {
      const next = !profile.notify_reminders;
      if (next && !isPro) {
        Alert.alert(
          'Pro Feature',
          'Scheduled reminders are a Pro feature. Upgrade to unlock.',
          [{ text: 'OK' }]
        );
        return;
      }
      if (next && !profile.notify_push) {
        Alert.alert(
          'Enable Push First',
          'Enable Push Notifications first to receive scheduled reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
      setSaving(true);
      try {
        await update({ notify_reminders: next });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleExport = async () => {
    try {
      const json = await exportUserData();
      const filename = `dosebase-export-${new Date().toISOString().split('T')[0]}.json`;
      const path = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(path, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Share.share({
        title: filename,
        url: path,          // iOS: share sheet with the file
        message: Platform.OS === 'android' ? json : undefined, // Android fallback: share text
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Export Failed', err instanceof Error ? err.message : 'Could not export data.');
    }
  };

  const handleImport = () => {
    Alert.alert(
      'Import Data',
      'Paste your JSON export below or use the share sheet to open a file with this app. This will merge data into your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import from Clipboard',
          onPress: async () => {
            try {
              // React Native's Clipboard is opt-in; use a prompt instead for wider compat
              Alert.prompt?.(
                'Paste JSON',
                'Paste your exported JSON here:',
                async (text) => {
                  if (!text?.trim()) return;
                  setImporting(true);
                  try {
                    const result = await importUserData(text);
                    Alert.alert(
                      'Import Successful',
                      `Imported ${result.compoundsImported} protocols, ${result.injectionsImported} logs, ${result.checkInsImported} check-ins.`
                    );
                  } catch (e) {
                    Alert.alert('Import Failed', e instanceof Error ? e.message : 'Unknown error');
                  } finally {
                    setImporting(false);
                  }
                },
                'plain-text'
              ) ?? Alert.alert('Not Supported', 'Text prompt is not available on this platform.');
            } catch (err) {
              console.error(err);
            }
          },
        },
      ]
    );
  };

  const handleSeedDemo = async () => {
    if (!user || !isTestAccount) return;
    setSeeding(true);
    try {
      let result = await seedDemoData({ days: 30, force: false });
      if (result.skipped) {
        Alert.alert(
          'Replace Existing Data',
          'You already have protocols. This will wipe all your current data and replace it with demo data.',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setSeeding(false) },
            {
              text: 'Wipe & Replace',
              style: 'destructive',
              onPress: async () => {
                try {
                  result = await seedDemoData({ days: 30, force: true });
                  Alert.alert(
                    'Done',
                    `Demo data created: ${result.compounds} protocols, ${result.injections} logs, ${result.checkins} check-ins`
                  );
                } catch (e) {
                  Alert.alert('Seeding Failed', e instanceof Error ? e.message : 'Unknown error');
                } finally {
                  setSeeding(false);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Done',
          `Demo data created: ${result.compounds} protocols, ${result.injections} logs, ${result.checkins} check-ins`
        );
        setSeeding(false);
      }
    } catch (err) {
      Alert.alert('Seeding Failed', err instanceof Error ? err.message : 'Unknown error');
      setSeeding(false);
    }
  };

  const handleResetOnboarding = async () => {
    if (!user) return;
    try {
      await update({ onboarding_completed: false, onboarding_version: 1 });
      router.replace('/(onboarding)');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Reset onboarding failed');
    }
  };

  const handleResetAllData = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your protocols, logs, and check-ins. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            // Second confirmation
            Alert.alert(
              'Are you sure?',
              'All data will be wiped and your settings reset.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, wipe everything',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await clearUserData();
                      await update({
                        units: 'imperial',
                        theme: 'system',
                        notify_push: true,
                        notify_reminders: true,
                      });
                      Alert.alert('Done', 'All data has been reset.');
                    } catch (err) {
                      Alert.alert('Error', err instanceof Error ? err.message : 'Reset failed');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleInvite = async () => {
    try {
      await Share.share({
        title: 'Aesthetic Logbook',
        message: 'Check out this app for tracking your wellness journey. https://dosebase.app',
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ── Render ───────────────────────────────────────────────────────

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
        <View style={styles.headerWrap}>
          <Text style={[styles.title, { color: textPrimary }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>Preferences & Support</Text>
        </View>

        {/* ── PREFERENCES ── */}
        <SectionLabel label="Preferences" color={textMuted} />
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>

          {/* Unit System */}
          <Text style={[styles.itemTitle, { color: textPrimary }]}>Unit System</Text>
          <View style={[styles.segment, { backgroundColor: fieldBg }]}>
            <SegmentBtn
              label="Imperial"
              active={profile?.units === 'imperial' || !profile?.units}
              isDark={isDark}
              onPress={() => void setUnits('imperial')}
            />
            <SegmentBtn
              label="Metric"
              active={profile?.units === 'metric'}
              isDark={isDark}
              onPress={() => void setUnits('metric')}
            />
          </View>
          <Text style={[styles.helpText, { color: textMuted }]}>Affects weight & measurement display</Text>

          <View style={[styles.divider, { backgroundColor: cardBorder }]} />

          {/* Appearance */}
          <Text style={[styles.itemTitle, { color: textPrimary }]}>Appearance</Text>
          <View style={[styles.segment, { backgroundColor: fieldBg }]}>
            <SegmentBtn
              label="Light"
              icon="sun-o"
              active={profile?.theme === 'light'}
              isDark={isDark}
              onPress={() => void setTheme('light')}
            />
            <SegmentBtn
              label="Dark"
              icon="moon-o"
              active={profile?.theme === 'dark'}
              isDark={isDark}
              onPress={() => void setTheme('dark')}
            />
            <SegmentBtn
              label="System"
              icon="desktop"
              active={profile?.theme === 'system' || !profile?.theme}
              isDark={isDark}
              onPress={() => void setTheme('system')}
            />
          </View>
        </View>

        {/* ── NOTIFICATIONS ── */}
        <SectionLabel label="Notifications" color={textMuted} />
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <ToggleRow
            icon="bell"
            iconBg="#CBE4F9"
            iconColor="#3B82F6"
            label="Push Notifications"
            helper="Enable all app alerts"
            value={Boolean(profile?.notify_push)}
            onPress={() => void toggleNotify('notify_push')}
            textPrimary={textPrimary}
            textMuted={textMuted}
            isDark={isDark}
          />
          <View style={[styles.divider, { backgroundColor: cardBorder }]} />
          <ToggleRow
            icon="info-circle"
            iconBg={fieldBg}
            iconColor={textMuted}
            label="Schedule Reminders"
            helper={!isPro ? 'Pro feature' : !profile?.notify_push ? 'Enable push first' : 'Notify when doses are due'}
            value={Boolean(profile?.notify_reminders && profile?.notify_push)}
            onPress={() => void toggleNotify('notify_reminders')}
            textPrimary={textPrimary}
            textMuted={textMuted}
            isDark={isDark}
          />
        </View>

        {/* ── ACCOUNT ── */}
        <SectionLabel label="Account" color={textMuted} />
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.accountRow}>
            <View style={[styles.accountAvatar, { backgroundColor: '#FDF4C4' }]}>
              <FontAwesome name="user" size={16} color="#78716C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.accountLabel, { color: textMuted }]}>Signed in as</Text>
              <Text style={[styles.accountEmail, { color: textPrimary }]} numberOfLines={1}>
                {user?.email ?? 'Unknown user'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onSignOut}
            disabled={loading || saving}
            style={[
              styles.signOutBtn,
              { backgroundColor: isDark ? '#FAFAF9' : '#1C1917' },
              (loading || saving) && styles.disabled,
            ]}
          >
            <FontAwesome name="sign-out" size={13} color={isDark ? '#1C1917' : '#FFFFFF'} />
            <Text style={[styles.signOutText, { color: isDark ? '#1C1917' : '#FFFFFF' }]}>
              {loading ? 'Signing out…' : saving ? 'Saving…' : 'Sign Out'}
            </Text>
          </Pressable>
        </View>

        {/* ── SUPPORT ── */}
        <SectionLabel label="Support" color={textMuted} />
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <InfoRow
            icon="question-circle"
            iconBg="#FDF4C4"
            iconColor="#78716C"
            title="FAQ"
            subtitle="Frequently asked questions"
            textPrimary={textPrimary}
            textMuted={textMuted}
            onPress={() => router.push('/faq')}
          />

          <View style={[styles.divider, { backgroundColor: cardBorder }]} />

          <InfoRow
            icon="book"
            iconBg="#CBE4F9"
            iconColor="#3B82F6"
            title="Research Vault"
            subtitle="Educational compound reference"
            textPrimary={textPrimary}
            textMuted={textMuted}
            onPress={() => router.push('/research')}
          />

          {/* Medical Disclaimer */}
          <View style={[styles.disclaimerBox, { backgroundColor: isDark ? 'rgba(253,244,196,0.12)' : 'rgba(253,244,196,0.5)' }]}>
            <View style={styles.disclaimerIconWrap}>
              <FontAwesome name="shield" size={14} color="#78716C" />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
              <Text style={styles.disclaimerBody}>
                This application is for informational and educational purposes only. It is not a substitute for professional medical advice.
              </Text>
            </View>
          </View>
        </View>

        {/* ── LEGAL & COMMUNITY ── */}
        <SectionLabel label="Legal & Community" color={textMuted} />
        <View style={{ gap: 10 }}>
          {/* Two-column legal grid */}
          <View style={styles.legalGrid}>
            <LegalCard
              icon="file-text-o"
              label="Terms of Use"
              cardBg={cardBg}
              cardBorder={cardBorder}
              textPrimary={textPrimary}
              textMuted={textMuted}
              onPress={() => router.push('/terms')}
            />
            <LegalCard
              icon="lock"
              label="Privacy Policy"
              cardBg={cardBg}
              cardBorder={cardBorder}
              textPrimary={textPrimary}
              textMuted={textMuted}
              onPress={() => router.push('/privacy')}
            />
          </View>

          {/* Invite CTA */}
          <Pressable
            onPress={() => void handleInvite()}
            style={[
              styles.inviteBtn,
              { backgroundColor: isDark ? '#FAFAF9' : '#1C1917' },
              ...(Platform.OS === 'ios'
                ? [{
                    shadowColor: isDark ? '#FAFAF9' : '#1C1917',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.18,
                    shadowRadius: 20,
                  }]
                : []),
            ]}
          >
            <FontAwesome name="share-alt" size={18} color={isDark ? '#1C1917' : '#FFFFFF'} />
            <Text style={[styles.inviteBtnText, { color: isDark ? '#1C1917' : '#FFFFFF' }]}>
              Invite a Friend
            </Text>
          </Pressable>
        </View>

        {/* ── DATA CONTROL ── */}
        <SectionLabel label="Data Control" color={textMuted} />
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: cardBorder, padding: 0, overflow: 'hidden' }]}>
          <DataRow
            icon="download"
            iconBg="#CBE4F9"
            iconColor="#3B82F6"
            label="Export Data"
            textPrimary={textPrimary}
            textMuted={textMuted}
            cardBorder={cardBorder}
            isLast={false}
            onPress={() => void handleExport()}
          />
          <DataRow
            icon="upload"
            iconBg="#CDF5E3"
            iconColor="#10B981"
            label={importing ? 'Importing…' : 'Import Data'}
            textPrimary={textPrimary}
            textMuted={textMuted}
            cardBorder={cardBorder}
            isLast={false}
            disabled={importing}
            onPress={handleImport}
          />
          {isTestAccount && (
            <DataRow
              icon="book"
              iconBg="#FDF4C4"
              iconColor="#78716C"
              label={seeding ? 'Seeding…' : 'Seed Demo Data'}
              textPrimary={textPrimary}
              textMuted={textMuted}
              cardBorder={cardBorder}
              isLast={false}
              disabled={seeding}
              onPress={() => void handleSeedDemo()}
            />
          )}
          <DataRow
            icon="info-circle"
            iconBg={fieldBg}
            iconColor={textMuted}
            label="Reset Onboarding"
            textPrimary={textPrimary}
            textMuted={textMuted}
            cardBorder={cardBorder}
            isLast={false}
            onPress={() => void handleResetOnboarding()}
          />
          <DataRow
            icon="trash"
            iconBg={fieldBg}
            iconColor="#EF4444"
            label="Reset All Data"
            textPrimary="#EF4444"
            textMuted={textMuted}
            cardBorder={cardBorder}
            isLast={true}
            onPress={handleResetAllData}
          />
        </View>

        {/* ── ABOUT FOOTER ── */}
        <View style={[styles.aboutCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={[styles.aboutIconWrap, { backgroundColor: '#FDF4C4' }]}>
            <FontAwesome name="mobile" size={20} color="#78716C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.aboutTitle, { color: textPrimary }]}>Aesthetic Logbook</Text>
            <Text style={[styles.aboutVersion, { color: textMuted }]}>v0.2.0 (MVP)</Text>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  );
}

// ── Sub-components ────────────────────────────────────────────────

function SectionLabel({ label, color }: { label: string; color: string }) {
  return (
    <Text style={[styles.sectionLabel, { color }]}>{label.toUpperCase()}</Text>
  );
}

function SegmentBtn({
  label,
  icon,
  active,
  isDark,
  onPress,
}: {
  label: string;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  active: boolean;
  isDark: boolean;
  onPress: () => void;
}) {
  const activeBg = isDark ? '#FAFAF9' : '#FFFFFF';
  const activeText = isDark ? '#1C1917' : '#1C1917';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.segmentButton,
        active && [
          styles.segmentButtonActive,
          { backgroundColor: activeBg },
          ...(Platform.OS === 'ios'
            ? [{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
              }]
            : []),
        ],
      ]}
    >
      {icon ? (
        <FontAwesome
          name={icon}
          size={13}
          color={active ? activeText : '#78716C'}
        />
      ) : null}
      <Text style={[styles.segmentText, active && { color: activeText }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ToggleRow({
  icon,
  iconBg,
  iconColor,
  label,
  helper,
  value,
  onPress,
  textPrimary,
  textMuted,
  isDark,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  iconBg: string;
  iconColor: string;
  label: string;
  helper: string;
  value: boolean;
  onPress: () => void;
  textPrimary: string;
  textMuted: string;
  isDark: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.toggleRow}>
      <View style={[styles.toggleIconWrap, { backgroundColor: iconBg }]}>
        <FontAwesome name={icon} size={14} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleTitle, { color: textPrimary }]}>{label}</Text>
        <Text style={[styles.toggleHelper, { color: textMuted }]}>{helper}</Text>
      </View>
      {/* Toggle pill */}
      <View
        style={[
          styles.pill,
          value
            ? { backgroundColor: isDark ? '#FAFAF9' : '#1C1917' }
            : { backgroundColor: '#D6D3D1' },
        ]}
      >
        <View style={[styles.dot, value ? styles.dotOn : styles.dotOff]} />
      </View>
    </Pressable>
  );
}

function InfoRow({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  textPrimary,
  textMuted,
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  textPrimary: string;
  textMuted: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.infoRow} onPress={onPress}>
      <View style={[styles.toggleIconWrap, { backgroundColor: iconBg }]}>
        <FontAwesome name={icon} size={14} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleTitle, { color: textPrimary }]}>{title}</Text>
        <Text style={[styles.toggleHelper, { color: textMuted }]}>{subtitle}</Text>
      </View>
      <FontAwesome name="chevron-right" size={12} color={textMuted} />
    </Pressable>
  );
}

function LegalCard({
  icon,
  label,
  cardBg,
  cardBorder,
  textPrimary,
  textMuted,
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textMuted: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.legalCard,
        { backgroundColor: cardBg, borderColor: cardBorder },
        ...(Platform.OS === 'ios'
          ? [{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.04,
              shadowRadius: 8,
            }]
          : []),
      ]}
    >
      <View style={[styles.legalIconWrap, { backgroundColor: '#F5F5F4' }]}>
        <FontAwesome name={icon} size={16} color={textMuted} />
      </View>
      <Text style={[styles.legalLabel, { color: textPrimary }]}>{label}</Text>
      <FontAwesome name="chevron-right" size={11} color={textMuted} />
    </Pressable>
  );
}

function DataRow({
  icon,
  iconBg,
  iconColor,
  label,
  textPrimary,
  textMuted,
  cardBorder,
  isLast,
  disabled,
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  iconBg: string;
  iconColor: string;
  label: string;
  textPrimary: string;
  textMuted: string;
  cardBorder: string;
  isLast: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.dataRow,
        !isLast && { borderBottomWidth: 1, borderBottomColor: cardBorder },
        disabled && styles.disabled,
      ]}
    >
      <View style={[styles.toggleIconWrap, { backgroundColor: iconBg }]}>
        <FontAwesome name={icon} size={14} color={iconColor} />
      </View>
      <Text style={[styles.dataRowLabel, { color: textPrimary }]}>{label}</Text>
      <FontAwesome name="chevron-right" size={12} color={textMuted} />
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: { gap: 12 },

  headerWrap: { gap: 4, paddingBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontWeight: '600' },

  sectionLabel: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
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
  divider: { height: 1, marginVertical: 2 },

  itemTitle: { fontSize: 14, fontWeight: '700' },
  helpText: { fontSize: 10, fontWeight: '500', marginTop: -4 },

  // Segment
  segment: {
    borderRadius: 12,
    padding: 4,
    flexDirection: 'row',
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    minHeight: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  segmentButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  segmentText: { fontSize: 12, fontWeight: '700', color: '#78716C' },

  // Toggle rows
  toggleRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: { fontSize: 13, fontWeight: '700' },
  toggleHelper: { fontSize: 12, fontWeight: '500' },
  pill: { width: 48, height: 28, borderRadius: 999, padding: 3, justifyContent: 'center' },
  dot: { width: 22, height: 22, borderRadius: 999, backgroundColor: '#FFFFFF' },
  dotOn: { alignSelf: 'flex-end' },
  dotOff: { alignSelf: 'flex-start' },

  // Account
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accountAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  accountEmail: { fontSize: 13, fontWeight: '700' },
  signOutBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 100,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 16,
  },
  signOutText: { fontSize: 13, fontWeight: '700' },

  // Info rows
  infoRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  // Disclaimer
  disclaimerBox: {
    marginTop: 4,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },
  disclaimerIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(253,244,196,0.8)',
    marginTop: 1,
  },
  disclaimerTitle: {
    color: '#57534E',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  disclaimerBody: { color: '#78716C', fontSize: 11, fontWeight: '500', lineHeight: 16 },

  // Legal
  legalGrid: { flexDirection: 'row', gap: 10 },
  legalCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    alignItems: 'center',
  },
  legalIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },

  inviteBtn: {
    height: 58,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  inviteBtnText: { fontSize: 16, fontWeight: '700' },

  // Data rows
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  dataRowLabel: { flex: 1, fontSize: 14, fontWeight: '600' },

  // About
  aboutCard: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
  aboutIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutTitle: { fontSize: 15, fontWeight: '800' },
  aboutVersion: { fontSize: 12, fontWeight: '600' },

  disabled: { opacity: 0.6 },
});
