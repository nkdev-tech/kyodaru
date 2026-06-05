/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#313D4C', // ink-1
    background: '#F1F5FA', // paper
    backgroundElement: '#F4F8FC', // surface-2
    backgroundSelected: '#D2E9F2', // primary-soft
    textSecondary: '#687686', // ink-2
  },
  dark: {
    text: '#DCE4EF',
    background: '#1A2230',
    backgroundElement: '#243040',
    backgroundSelected: '#2F4060',
    textSecondary: '#8A96A6',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = {
  display: 'ZenMaruGothic_700Bold',
  body: 'MPLUSRounded1c_400Regular',
  bodyMedium: 'MPLUSRounded1c_500Medium',
  bodyBold: 'MPLUSRounded1c_700Bold',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
