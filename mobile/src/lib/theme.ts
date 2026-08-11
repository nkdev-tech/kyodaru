import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

// NativeWind は src/global.css の CSS カスタムプロパティを使用し、
// React Navigation は JS オブジェクトを必要とするため二重定義になっている。
// 値を変更する場合は src/global.css と両方を更新すること。
export const THEME = {
  light: {
    background: 'hsl(213 47% 95%)',
    foreground: 'hsl(213 22% 25%)',
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(213 22% 25%)',
    popover: 'hsl(0 0% 100%)',
    popoverForeground: 'hsl(213 22% 25%)',
    primary: 'hsl(198 52% 55%)',
    primaryForeground: 'hsl(0 0% 100%)',
    secondary: 'hsl(213 30% 90%)',
    secondaryForeground: 'hsl(213 22% 55%)',
    muted: 'hsl(209 57% 97%)',
    mutedForeground: 'hsl(213 15% 68%)',
    accent: 'hsl(197 55% 89%)',
    accentForeground: 'hsl(198 54% 40%)',
    destructive: 'hsl(352 42% 58%)',
    border: 'hsl(210 34% 92%)',
    input: 'hsl(210 30% 87%)',
    ring: 'hsl(198 52% 55%)',
    radius: '1.125rem',
  },
  dark: {
    background: 'hsl(213 32% 10%)',
    foreground: 'hsl(213 20% 88%)',
    card: 'hsl(213 27% 23%)',
    cardForeground: 'hsl(213 20% 88%)',
    popover: 'hsl(213 27% 23%)',
    popoverForeground: 'hsl(213 20% 88%)',
    primary: 'hsl(198 52% 55%)',
    primaryForeground: 'hsl(0 0% 100%)',
    secondary: 'hsl(213 20% 20%)',
    secondaryForeground: 'hsl(213 18% 60%)',
    muted: 'hsl(213 25% 16%)',
    mutedForeground: 'hsl(213 15% 55%)',
    accent: 'hsl(198 40% 28%)',
    accentForeground: 'hsl(198 52% 75%)',
    destructive: 'hsl(352 42% 50%)',
    border: 'hsl(213 22% 28%)',
    input: 'hsl(213 22% 28%)',
    ring: 'hsl(198 52% 55%)',
    radius: '1.125rem',
  },
};

export const NAV_THEME: Record<'light' | 'dark', Theme> = {
  light: {
    ...DefaultTheme,
    colors: {
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
