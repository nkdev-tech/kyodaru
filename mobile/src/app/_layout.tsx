import '../global.css';

import { ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { NAV_THEME } from '@/lib/theme';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? NAV_THEME.dark : NAV_THEME.light}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
