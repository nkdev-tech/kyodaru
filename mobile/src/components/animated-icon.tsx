import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Constants from 'expo-constants';
import { Fonts } from '@/constants/theme';

const DURATION = 600;

export function AnimatedSplashOverlay({ ready }: { ready: boolean }) {
  const [visible, setVisible] = useState(true);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!ready) return;
    opacity.value = withTiming(
      0,
      { duration: DURATION, easing: Easing.elastic(0.7) },
      (finished) => {
        'worklet';
        if (finished) scheduleOnRN(setVisible, false);
      },
    );
  }, [ready, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, animatedStyle]}>
      <Text style={styles.title}>今日もだるい</Text>
      <Image source={require('@/assets/images/mascot.png')} style={styles.mascot} />
      <Text style={styles.version}>v{Constants.expoConfig?.version}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#4FA3C7',
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: '#FFFFFF',
  },
  version: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  mascot: {
    width: 240,
    height: 240,
  },
});
