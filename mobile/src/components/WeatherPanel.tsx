import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { Separator } from '@/components/ui/separator';
import { getWeatherIcon } from '@/lib/weather-icon';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Gauge, Thermometer } from 'lucide-react-native';

type Props = {
  weatherInfo: {
    pressure: number | null;
    temperature: number | null;
    weather: string | null;
  };
};

export function WeatherPanel({ weatherInfo }: Props) {
  return (
    <View className="mx-5 mt-3 flex-row self-stretch rounded-2xl bg-card px-4 py-3 shadow-sm shadow-black/5">
      <View className="flex-1 flex-row items-center gap-4 bg-transparent px-2">
        {weatherInfo.weather ? (
          <Icon
            as={getWeatherIcon(weatherInfo.weather)}
            size={40}
            fill="currentColor"
            className="text-primary"
          />
        ) : (
          <View className="h-10 w-10 bg-muted" />
        )}
        <View className="gap-1 bg-transparent">
          <Text className="text-xs text-muted-foreground">
            {format(new Date(), 'M月d日(E)', { locale: ja })}
          </Text>
          <Text className="font-body-bold text-lg">{weatherInfo.weather ?? '---'}</Text>
        </View>
      </View>
      <Separator orientation="vertical" className="h-auto self-stretch" />
      <View className="flex-1 flex-col justify-center gap-1 bg-transparent pl-4">
        <View className="flex-1 flex-row items-center gap-2 bg-transparent">
          <Icon as={Thermometer} size={20} className="text-muted-foreground" />
          <Text className="font-body-medium text-base">
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
    </View>
  );
}
