import '../global.css';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  MPLUSRounded1c_400Regular,
  MPLUSRounded1c_500Medium,
  MPLUSRounded1c_700Bold,
} from '@expo-google-fonts/m-plus-rounded-1c';
import { ZenMaruGothic_700Bold } from '@expo-google-fonts/zen-maru-gothic';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NAV_THEME } from '@/lib/theme';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { authClient } from '@/lib/auth-client';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    ZenMaruGothic_700Bold,
    MPLUSRounded1c_400Regular,
    MPLUSRounded1c_500Medium,
    MPLUSRounded1c_700Bold,
  });
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await authClient.getSession();
        if (!data) {
          await authClient.signIn.anonymous();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSessionReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && sessionReady) {
      (async () => {
        await SplashScreen.hideAsync();
      })();
    }
  }, [fontsLoaded, fontError, sessionReady]);

  if ((!fontsLoaded && !fontError) || !sessionReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? NAV_THEME.dark : NAV_THEME.light}>
          <AnimatedSplashOverlay />
          <AppTabs />
        </ThemeProvider>
        <PortalHost />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
