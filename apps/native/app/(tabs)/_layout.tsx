import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { getUiPalette } from '@/theme/ui';

const REQUIRED_DISCLAIMER_VERSION = 1;
const REQUIRED_ONBOARDING_VERSION = 1;

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  size?: number;
}) {
  return <FontAwesome style={styles.tabIcon} {...props} size={props.size ?? 24} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = getUiPalette(isDark);
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useProfile();

  if (loading || profileLoading) return null;
  if (!user) return <Redirect href="/(auth)/sign-in" />;
  if (profileError) return <Redirect href="/(auth)/sign-in" />;
  if (!profile) return <Redirect href="/(auth)/sign-in" />;
  if ((profile.disclaimer_version ?? 0) < REQUIRED_DISCLAIMER_VERSION) {
    return <Redirect href="/(onboarding)/disclaimer" />;
  }
  if (!profile.onboarding_completed || (profile.onboarding_version ?? 0) < REQUIRED_ONBOARDING_VERSION) {
    return <Redirect href="/(onboarding)" />;
  }

  // Active: stone-900 (light) / white (dark); Inactive: stone-300 (light) / stone-600 (dark)
  const activeColor = isDark ? '#FAFAF9' : '#1C1917';
  const inactiveColor = isDark ? '#57534E' : '#D6D3D1';
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 24,
          right: 24,
          bottom: 24,
          height: 64,
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(41,37,36,1)' : 'rgba(255,255,255,0.5)',
          borderRadius: 24,
          backgroundColor: isDark ? 'rgba(28,25,23,0.90)' : 'rgba(255,255,255,0.90)',
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: 8,
          ...(Platform.OS === 'ios'
            ? {
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isDark ? 0.22 : 0.06,
                shadowRadius: 30,
              }
            : {}),
        },
        tabBarItemStyle: { flex: 1, marginHorizontal: 0, borderRadius: 16 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name="home"
              size={24}
              color={color}
              style={styles.tabIcon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="protocols"
        options={{
          title: 'Protocols',
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name="list-ul"
              size={22}
              color={color}
              style={styles.tabIcon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          tabBarButton: ({ onPress, accessibilityLabel, accessibilityState, testID }) => (
            <Pressable
              onPress={onPress}
              accessibilityLabel={accessibilityLabel}
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              testID={testID}
              style={styles.fabSlot}
            >
              <View
                style={[
                  styles.fabButton,
                  {
                    backgroundColor: isDark ? '#FAFAF9' : '#1C1917',
                  },
                ]}
              >
                <FontAwesome
                  name="plus"
                  size={22}
                  color={isDark ? '#1C1917' : '#FFFFFF'}
                />
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="trends"
        options={{
          title: 'Trends',
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name="heartbeat"
              size={22}
              color={color}
              style={styles.tabIcon}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <FontAwesome
              name="cog"
              size={22}
              color={color}
              style={styles.tabIcon}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    marginBottom: 0,
  },
  fabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  fabButton: {
    width: 48,
    height: 48,
    marginTop: -16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'ios'
      ? {
          shadowColor: '#1C1917',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
        }
      : {}),
  },
});
