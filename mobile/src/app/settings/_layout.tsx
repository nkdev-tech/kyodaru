import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: '設定' }} />
      <Stack.Screen name="account" options={{ title: 'アカウント設定' }} />
    </Stack>
  );
}
