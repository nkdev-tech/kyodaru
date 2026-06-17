import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Gauge,
  Sun,
  Thermometer,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

type Props = {
  weatherInfo: {
    pressure: number | null;
    temperature: number | null;
    weather: string | null;
  };
};

function getWeatherIcon(weather: string): LucideIcon {
  if (['快晴', '晴れ'].includes(weather)) return Sun;
  if (['霧雨'].includes(weather)) return CloudDrizzle;
  if (['霧'].includes(weather)) return CloudFog;
  if (['小雨', '雨', '大雨', 'にわか雨'].includes(weather)) return CloudRain;
  if (['小雪', '雪', '大雪', 'にわか雪', 'あられ'].includes(weather)) return CloudSnow;
  if (['雷雨', 'ひょう'].includes(weather)) return CloudLightning;
  return Cloud;
}

export function WeatherPanel({ weatherInfo }: Props) {
  if (
    weatherInfo.pressure == null ||
    weatherInfo.temperature == null ||
    weatherInfo.weather == null
  )
    return null;

  return (
    <View className="mx-5 mt-3 flex-row self-stretch rounded-2xl bg-card px-4 py-3 shadow-sm shadow-black/5">
      <View className="flex-1 flex-row items-center gap-4 bg-transparent px-2">
        <Icon
          as={getWeatherIcon(weatherInfo.weather)}
          size={40}
          fill="currentColor"
          className="text-primary"
        />
        <View className="gap-1 bg-transparent">
          <Text className="text-xs text-muted-foreground">
            {format(new Date(), 'M/d(E)', { locale: ja })}
          </Text>
          <Text className="text-lg font-bold">{weatherInfo.weather}</Text>
        </View>
      </View>
      <Separator orientation="vertical" className="h-auto self-stretch" />
      <View className="flex-1 flex-col justify-center gap-1 bg-transparent pl-4">
        <View className="flex-1 flex-row items-center gap-2 bg-transparent">
          <Icon as={Thermometer} size={20} className="text-muted-foreground" />
          <Text className="text-base font-bold">{weatherInfo.temperature}℃</Text>
        </View>
        <View className="flex-1 flex-row items-center gap-2 bg-transparent">
          <Icon as={Gauge} size={18} className="text-muted-foreground" />
          <Text className="text-sm font-semibold">
            {weatherInfo.pressure}{' '}
            <Text className="text-xs font-semibold text-muted-foreground">hPa</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
