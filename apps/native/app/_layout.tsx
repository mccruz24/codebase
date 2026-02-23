import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProfileProvider } from '@/contexts/ProfileContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AuthProvider>
        <ProfileProvider>
          <RootLayoutNavInner />
        </ProfileProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutNavInner() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="compound-form" options={{ headerShown: false }} />
        <Stack.Screen name="calendar" options={{ headerShown: false }} />
        <Stack.Screen name="check-in" options={{ headerShown: false }} />
        <Stack.Screen name="faq" options={{ headerShown: false }} />
        <Stack.Screen name="terms" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ headerShown: false }} />
        <Stack.Screen name="research" options={{ headerShown: false }} />
        <Stack.Screen name="research-detail" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
