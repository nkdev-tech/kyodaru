import '../global.css';

import { useEffect, useState } from 'react';
import { focusManager, QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
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
import { Alert, AppState, AppStateStatus, Linking, Platform, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';
import { useGetApiVersionCheck } from '@/external/api';
import { weatherQueryOptions } from '@/hooks/use-weather';
import { IOS_APP_STORE_ID } from '@/lib/config';
import { NAV_THEME } from '@/lib/theme';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { authClient } from '@/lib/auth-client';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export function AppContent() {
  const [fontsLoaded, fontError] = useFonts({
    ZenMaruGothic_700Bold,
    MPLUSRounded1c_400Regular,
    MPLUSRounded1c_500Medium,
    MPLUSRounded1c_700Bold,
  });
  const [sessionReady, setSessionReady] = useState(false);
  const { data, isLoading: isVersionLoading } = useGetApiVersionCheck({
    query: { retry: 1 },
  });
  const { isLoading: isWeatherLoading } = useQuery(weatherQueryOptions);

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

  useEffect(() => {
    if (data?.status === 426) {
      Alert.alert(
        'アップデートのお知らせ',
        'アプリを最新バージョンに更新してください',
        [
          {
            text: 'アップデート',
            onPress: () => {
              const url =
                Platform.OS === 'ios'
                  ? `itms-apps://itunes.apple.com/app/${IOS_APP_STORE_ID}`
                  : 'market://details?id=com.nkdevtech.kyodaru';
              Linking.openURL(url);
            },
          },
        ],
        { cancelable: false },
      );
    }
  }, [data]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if ((!fontsLoaded && !fontError) || !sessionReady || isVersionLoading) return null;

  const ready =
    (fontsLoaded || fontError) &&
    sessionReady &&
    !isVersionLoading &&
    data?.status !== 426 &&
    !isWeatherLoading;

  return (
    <>
      <AnimatedSplashOverlay ready={ready ?? false} />
      {ready && <AppTabs />}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? NAV_THEME.dark : NAV_THEME.light}>
          <AppContent />
          <Toaster />
        </ThemeProvider>
        <PortalHost />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
