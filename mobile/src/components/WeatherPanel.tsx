import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useColorScheme } from 'react-native';
import { THEME } from '@/lib/theme';
import { getWeatherIcon } from '@/lib/weather-icon';
import { LinearGradient } from 'expo-linear-gradient';
import { Gauge, CircleQuestionMark, Thermometer } from 'lucide-react-native';
import { cssInterop } from 'nativewind';

cssInterop(LinearGradient, { className: 'style' });

type Props = {
  weatherInfo: {
    pressure: number | null;
    temperature: number | null;
    weather: string | null;
    city: string | null;
  };
};

export function WeatherPanel({ weatherInfo }: Props) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = THEME[scheme];

  return (
    <LinearGradient
      colors={[theme.accent, theme.card]}
      className="flex-row self-stretch rounded-2xl px-4 py-2 shadow-sm shadow-black/5"
    >
      <View className="flex-1 flex-row items-center gap-4 bg-transparent px-2">
        {weatherInfo.weather ? (
          <Icon
            as={getWeatherIcon(weatherInfo.weather)}
            size={32}
            fill="currentColor"
            className="text-primary"
          />
        ) : (
          <View className="h-10 w-10 bg-muted" />
        )}
        <View className="bg-transparent">
          <View className="flex-row items-center gap-1 bg-transparent">
            <Text className="text-sm text-secondary-foreground">{weatherInfo.city ?? '---'}</Text>
            <Popover>
              <PopoverTrigger hitSlop={16}>
                <Icon as={CircleQuestionMark} size={14} className="text-secondary-foreground" />
              </PopoverTrigger>
              <PopoverContent side="bottom" className="w-auto max-w-xs">
                <Text>{'天気を表示するには\n位置情報をオンにしてください'}</Text>
              </PopoverContent>
            </Popover>
          </View>
          <Text className="font-body-medium text-lg">{weatherInfo.weather ?? '---'}</Text>
        </View>
      </View>
      <Separator orientation="vertical" className="h-auto self-stretch" />
      <View className="flex-1 flex-col justify-center gap-1 bg-transparent pl-4">
        <View className="flex-row items-center gap-2 bg-transparent">
          <Icon as={Thermometer} size={18} className="text-secondary-foreground" />
          <View className="flex-1 flex-row items-center gap-1 bg-transparent">
            <Text className="font-body-medium">{weatherInfo.temperature ?? '---'}</Text>
            <Text className="text-secondary-foreground">℃</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2 bg-transparent">
          <Icon as={Gauge} size={18} className="text-secondary-foreground" />
          <View className="flex-1 flex-row items-center gap-1 bg-transparent">
            <Text className="font-body-medium">{weatherInfo.pressure ?? '---'}</Text>
            <Text className="font-body text-secondary-foreground">hPa</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
