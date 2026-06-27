import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { Separator } from '@/components/ui/separator';
import { getWeatherIcon } from '@/lib/weather-icon';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import { Gauge, Thermometer } from 'lucide-react-native';
import { cssInterop } from 'nativewind';

cssInterop(LinearGradient, { className: 'style' });

type Props = {
  weatherInfo: {
    pressure: number | null;
    temperature: number | null;
    weather: string | null;
  };
  today: Date;
};

export function WeatherPanel({ weatherInfo, today }: Props) {
  return (
    <LinearGradient
      colors={['#D2E9F2', '#FFFFFF']}
      className="flex-row self-stretch rounded-2xl px-4 py-3 shadow-sm shadow-black/5"
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
          <Text className="font-body-medium">{weatherInfo.weather ?? '---'}</Text>
          <Text className="text-xs text-muted-foreground">
            {format(today, 'M月d日(E)', { locale: ja })}
          </Text>
        </View>
      </View>
      <Separator orientation="vertical" className="h-auto self-stretch" />
      <View className="flex-1 flex-col justify-center gap-1 bg-transparent pl-4">
        <View className="flex-1 flex-row items-center gap-2 bg-transparent">
          <Icon as={Thermometer} size={18} className="text-muted-foreground" />
          <Text className="font-body-medium text-sm">
            {weatherInfo.temperature ?? '---'}{' '}
            <Text className="font-body text-xs text-muted-foreground">℃</Text>
          </Text>
        </View>
        <View className="flex-1 flex-row items-center gap-2 bg-transparent">
          <Icon as={Gauge} size={18} className="text-muted-foreground" />
          <Text className="font-body-medium text-sm">
            {weatherInfo.pressure ?? '---'}{' '}
            <Text className="font-body text-xs text-muted-foreground">hPa</Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
