import { useEffect, useMemo } from 'react';
import { Animated, View } from 'react-native';

export function Leader() {
  const { clock, opacities } = useMemo(() => {
    const clock = new Animated.Value(0);
    return {
      clock,
      opacities: [
        clock.interpolate({ inputRange: [0, 0.5, 1, 3], outputRange: [0.3, 1, 0.3, 0.3] }),
        clock.interpolate({ inputRange: [0, 1, 1.5, 2, 3], outputRange: [0.3, 0.3, 1, 0.3, 0.3] }),
        clock.interpolate({ inputRange: [0, 2, 2.5, 3], outputRange: [0.3, 0.3, 1, 0.3] }),
      ],
    };
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(clock, { toValue: 3, duration: 900, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [clock]);

  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
      accessibilityLabel="応答を生成中"
    >
      {opacities.map((opacity, i) => (
        <Animated.View
          key={i}
          className="h-2 w-2 rounded-full bg-muted-foreground"
          style={{ opacity }}
        />
      ))}
    </View>
  );
}
