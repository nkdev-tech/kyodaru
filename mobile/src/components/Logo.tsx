import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';

export function Logo() {
  return (
    <View className="flex-row items-center gap-2 bg-transparent">
      <Svg width={32} height={32} viewBox="0 0 76 76">
        <Defs>
          <LinearGradient id="lk" x1="0" y1="0" x2="0" y2="76" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#62B2D2" />
            <Stop offset="1" stopColor="#4090B4" />
          </LinearGradient>
        </Defs>
        <Path
          d="M36 3 C20 3 12 3 7 7 C3 12 3 20 3 36 C3 52 3 60 7 65 C12 69 20 69 36 69 C52 69 60 69 65 65 C69 60 69 52 69 36 C69 20 69 12 65 7 C60 3 52 3 36 3 Z"
          fill="url(#lk)"
        />
        <Path
          d="M24 50 C18 50 15 45 17 40 C15 34 21 30 27 32 C29 25 38 22 44 27 C49 22 58 24 60 31 C68 30 73 37 70 44 C74 47 72 53 65 54 C61 57 28 57 24 50 Z"
          fill="#FFFFFF"
        />
        <Path
          d="M31 41 C33 43 37 43 39 41"
          stroke="#3A7C9C"
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M49 41 C51 43 55 43 57 41"
          stroke="#3A7C9C"
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M40 47 C42 49 46 49 48 47"
          stroke="#3A7C9C"
          strokeWidth={2.1}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <Text className="font-display text-xl text-foreground">
        今日も<Text className="font-display text-xl text-accent-foreground">だるい</Text>
      </Text>
    </View>
  );
}
