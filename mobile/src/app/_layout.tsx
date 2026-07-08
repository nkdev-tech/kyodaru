import '../global.css';

import { useCallback, useEffect, useState } from 'react';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
import {
  Alert,
  AppState,
  AppStateStatus,
  Linking,
  Platform,
  useColorScheme,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';
import { useGetApiVersionCheck } from '@/external/api';
import { IOS_APP_STORE_ID } from '@/lib/config';
import { NAV_THEME } from '@/lib/theme';
import AppTabs from '@/components/app-tabs';
import { authClient } from '@/lib/auth-client';

// ネイティブスプラッシュ（mascot on #4FA3C7）を、アプリが完全に準備できるまで出したままにする。
// fade で消すことで、JS 側オーバーレイを持たずに白ギャップ・色の受け渡しを無くす。
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 400 });

const queryClient = new QueryClient();

export function AppContent() {
  const [fontsLoaded, fontError] = useFonts({
    ZenMaruGothic_700Bold,
    MPLUSRounded1c_400Regular,
    MPLUSRounded1c_500Medium,
    MPLUSRounded1c_700Bold,
  });
  const [sessionReady, setSessionReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // スプラッシュが一瞬で消えないよう、最低表示時間を確保する。
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const { data, isLoading: isVersionLoading } = useGetApiVersionCheck({
    query: { retry: 1 },
  });

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

  // フォント・セッション・バージョン確認・天気・最低表示時間がすべて揃うまで待つ。
  // 426（強制アップデート）のときは ready にならず、スプラッシュを出したまま Alert を見せる。
  const ready =
    (fontsLoaded || fontError) &&
    sessionReady &&
    !isVersionLoading &&
    data?.status !== 426 &&
    minTimeElapsed;

  // AppTabs が実際にレイアウトされてからネイティブスプラッシュを消す（白フラッシュ回避）。
  const onLayoutRootView = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch (e) {
      console.error(e);
    }
  }, []);

  // ready になるまでは何も描かない。その間はネイティブスプラッシュが画面を覆う。
  if (!ready) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppTabs />
    </View>
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
