import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

export function getWeatherIcon(weather: string): LucideIcon {
  if (['快晴', '晴れ'].includes(weather)) return Sun;
  if (['霧雨'].includes(weather)) return CloudDrizzle;
  if (['霧'].includes(weather)) return CloudFog;
  if (['小雨', '雨', '大雨', 'にわか雨'].includes(weather)) return CloudRain;
  if (['小雪', '雪', '大雪', 'にわか雪', 'あられ'].includes(weather)) return CloudSnow;
  if (['雷雨', 'ひょう'].includes(weather)) return CloudLightning;
  return Cloud;
}
