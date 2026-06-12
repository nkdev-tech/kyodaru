import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Ellipse, Path, Text as SvgText, TSpan } from 'react-native-svg';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { THEME } from '@/lib/theme';

type MascotExpression = 'default' | 'smile' | 'shonbori' | 'sleep';

type ExpressionData = {
  cheekCy: number;
  leftEye: string;
  rightEye: string;
  mouthD: string;
  tear?: boolean;
  zzz?: boolean;
};

const MESSAGES = [
  '今日もおつかれさまです',
  'ぼやいてもいいですよ',
  '体調を教えてください',
  'お疲れではないですか？',
  'ゆっくりしてください',
];

const CLOUD_BODY =
  'M52 104 C40 104 35 95 38 85 C35 73 46 65 58 68 C61 55 80 50 92 58 C102 50 120 53 125 67 C141 65 152 77 147 91 C155 98 151 110 138 112 C133 117 60 117 52 104 Z';
const HIGHLIGHT = 'M62 70 C70 60 84 56 96 62 C84 62 72 68 66 76 C63 80 60 75 62 70 Z';

const ALL_EXPRESSIONS: MascotExpression[] = ['default', 'smile', 'shonbori', 'sleep'];

const EXPRESSIONS: Record<MascotExpression, ExpressionData> = {
  default: {
    cheekCy: 92,
    leftEye: 'M69 83 L81 83',
    rightEye: 'M109 83 L121 83',
    mouthD: 'M91 99 C95 100.5 103 100.5 107 99',
  },
  smile: {
    cheekCy: 93,
    leftEye: 'M68 84 C72 79 78 79 82 84',
    rightEye: 'M108 84 C112 79 118 79 122 84',
    mouthD: 'M88 96 C94 104 104 104 110 96',
  },
  shonbori: {
    cheekCy: 95,
    leftEye: 'M69 82 Q75 88 81 82',
    rightEye: 'M109 82 Q115 88 121 82',
    mouthD: 'M92 102 Q100 97 108 102',
    tear: true,
  },
  sleep: {
    cheekCy: 93,
    leftEye: 'M68 84 C72 88 78 88 82 84',
    rightEye: 'M108 84 C112 88 118 88 122 84',
    mouthD: 'M93 98 C95.5 100 98.5 100 101 98',
    zzz: true,
  },
};

export function Mascot() {
  const translateY = useSharedValue(0);
  const [expression] = useState<MascotExpression>(
    () => ALL_EXPRESSIONS[Math.floor(Math.random() * ALL_EXPRESSIONS.length)],
  );
  const [message] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
  const expr = EXPRESSIONS[expression];
  const isDark = useColorScheme() === 'dark';
  const cardColor = isDark ? THEME.dark.card : THEME.light.card;

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, [translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View className="items-center">
      <View className="rounded-full bg-card px-6 py-4">
        <Text className="text-sm text-card-foreground">{message}</Text>
      </View>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 8,
          borderRightWidth: 8,
          borderTopWidth: 10,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: cardColor,
          marginTop: -1,
        }}
      />
      <Animated.View style={[animatedStyle, { marginTop: 24 }]}>
        <Svg width={200} height={117} viewBox="24 46 130 76" accessibilityLabel="だるくも">
          <Path d={CLOUD_BODY} fill="#BFD2E6" />
          <Path d={HIGHLIGHT} fill="#FFFFFF" opacity={0.5} />
          <Ellipse cx={70} cy={expr.cheekCy} rx={8.5} ry={5} fill="#8FB0D6" opacity={0.4} />
          <Ellipse cx={120} cy={expr.cheekCy} rx={8.5} ry={5} fill="#8FB0D6" opacity={0.4} />
          <Path
            d={expr.leftEye}
            stroke="#46566B"
            strokeWidth={4.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d={expr.rightEye}
            stroke="#46566B"
            strokeWidth={4.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d={expr.mouthD}
            stroke="#46566B"
            strokeWidth={3.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {expr.tear && (
            <Path
              d="M116 86 C116 92 111 94 111 99 C111 102.5 121 102.5 121 99 C121 94 116 92 116 86 Z"
              fill="#6E9FC9"
              opacity={0.9}
            />
          )}
          {expr.zzz && (
            <SvgText
              x={128}
              y={64}
              fontFamily="'Zen Maru Gothic','M PLUS Rounded 1c',sans-serif"
              fontSize={15}
              fontWeight="700"
              fill="#2F7E9F"
              opacity={0.7}
            >
              {'z'}
              <TSpan fontSize={10} dx={1} dy={-6}>
                {'z'}
              </TSpan>
            </SvgText>
          )}
        </Svg>
      </Animated.View>
    </View>
  );
}
