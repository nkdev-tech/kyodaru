import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      tintColor={colors.primary}
      indicatorColor={colors.backgroundSelected}
      iconColor={{ default: colors.textSecondary, selected: colors.primary }}
      labelStyle={{
        selected: { color: colors.primary, fontFamily: Fonts.bodyMedium },
        default: { color: colors.textSecondary, fontFamily: Fonts.body },
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>ホーム</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house" md="home" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Label>カレンダー</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>設定</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape" md="settings" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
