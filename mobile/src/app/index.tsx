import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePostApiAi, usePostApiEntries } from '@/external/api';
import { AIChat, UserChat } from '@/components/entries/chat';
import { Logo } from '@/components/Logo';
import { Mascot } from '@/components/Mascot';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Textarea } from '@/components/ui/textarea';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import type { LucideIcon } from 'lucide-react-native';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Gauge,
  MessageCircleMore,
  Send,
  Sun,
  Thermometer,
  X,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { fetchWeatherApi } from 'openmeteo';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const WEATHER_CODE: Record<number, string> = {
  0: '快晴',
  1: '晴れ',
  2: '薄曇り',
  3: 'くもり',
  45: '霧',
  48: '霧',
  51: '霧雨',
  53: '霧雨',
  55: '霧雨',
  61: '小雨',
  63: '雨',
  65: '大雨',
  71: '小雪',
  73: '雪',
  75: '大雪',
  77: 'あられ',
  80: 'にわか雨',
  81: 'にわか雨',
  82: 'にわか雨',
  85: 'にわか雪',
  86: 'にわか雪',
  95: '雷雨',
  96: '雷雨',
  99: 'ひょう',
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

async function getWeather(latitude?: number, longitude?: number) {
  if (latitude == null || longitude == null)
    return { pressure: null, temperature: null, weather: null };
  const params = {
    latitude: latitude,
    longitude: longitude,
    current: ['surface_pressure', 'temperature_2m', 'weather_code'],
    timezone: 'Asia/Tokyo',
    forecast_days: 1,
  };
  const url = 'https://api.open-meteo.com/v1/forecast';
  try {
    const responses = await fetchWeatherApi(url, params);

    const current = responses[0].current();
    if (!current) return { pressure: null, temperature: null, weather: null };

    const rawPressure = current.variables(0)?.value();
    const rawTemperature = current.variables(1)?.value();
    const rawWeatherCode = current.variables(2)?.value();
    const weather = rawWeatherCode != null ? (WEATHER_CODE[rawWeatherCode] ?? null) : null;

    return {
      pressure: rawPressure != null ? Math.round(rawPressure * 10) / 10 : null,
      temperature: rawTemperature != null ? Math.round(rawTemperature * 10) / 10 : null,
      weather,
    };
  } catch (e) {
    console.error(e);
    return { pressure: null, temperature: null, weather: null };
  }
}

export default function HomeScreen() {
  const [chatVisible, setChatVisible] = useState(false);
  const [mascotKey, setMascotKey] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [draft, setDraft] = useState('');
  const [inputKey, setInputKey] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<{
    pressure: number | null;
    temperature: number | null;
    weather: string | null;
  }>({ pressure: null, temperature: null, weather: null });
  const { mutate: mutateEntry, isPending: isPendingEntry } = usePostApiEntries();
  const { mutate: mutateReply, isPending: isPendingReply } = usePostApiAi();

  useEffect(() => {
    if (chatVisible) {
      // チャット画面が表示されてから少し遅らせて初期メッセージを出し、
      // AIが返答しているように見せる演出
      const timer = setTimeout(() => {
        setMessages([{ role: 'model', text: '今日の体調はいかがですか？' }]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [chatVisible]);

  useEffect(() => {
    async function getCurrentLocation() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        const { pressure, temperature, weather } = await getWeather(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
        );
        setWeatherInfo({ pressure, temperature, weather });
      } catch (e) {
        console.error(e);
        return;
      }
    }

    getCurrentLocation();
  }, []);

  const handleSend = (text: string = draft) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newMessage = [...messages, { role: 'user' as const, text: trimmed }];
    setMessages(newMessage);
    setDraft('');
    setInputKey((k) => k + 1);

    mutateReply(
      {
        data: {
          messages: newMessage,
        },
      },
      {
        onSuccess(result) {
          if (result.status !== 200) {
            Alert.alert('エラー', '送信に失敗しました。もう一度お試しください。');
            return;
          }
          const replies = result.data.reply.split('\n\n').filter((t) => t.trim());
          setMessages((prev) => [
            ...prev,
            ...replies.map((text) => ({ role: 'model' as const, text })),
          ]);
        },
        onError() {
          Alert.alert('エラー', '送信に失敗しました。もう一度お試しください。');
        },
      },
    );
  };

  const handleClose = () => {
    if (isPendingEntry) return;
    if (!messages.some((m) => m.role === 'user')) {
      setChatVisible(false);
      setMascotKey((k) => k + 1);
      return;
    }

    mutateEntry(
      {
        data: {
          rawText: messages
            .map((m) => `${m.role === 'model' ? 'AI' : 'ユーザー'}: ${m.text}`)
            .join('\n\n---\n\n'),
          latitude: location?.coords.latitude,
          longitude: location?.coords.longitude,
        },
      },
      {
        onSuccess(result) {
          if (result.status !== 201) {
            Alert.alert('エラー', '送信に失敗しました。もう一度お試しください。');
            return;
          }
          setChatVisible(false);
          setMessages([]);
          setDraft('');
          setMascotKey((k) => k + 1);
          // TODO: カレンダーと詳細が実装次第、消す
          Alert.alert(
            '保存完了',
            `要約: ${result.data.summary}\n体調レベル: ${result.data.conditionLevel}\n${result.data.weather}　${result.data.temperature?.toFixed(1)}度　${result.data.pressure?.toFixed(1)}hPa`,
          );
        },
        onError() {
          Alert.alert('エラー', '送信に失敗しました。もう一度お試しください。');
        },
      },
    );
  };

  return (
    <>
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1">
          <View className="mx-5 my-3">
            <Logo />
          </View>
          {weatherInfo.weather != null && (
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
          )}
          <View className="flex-1 items-center justify-center gap-6 bg-transparent">
            <Mascot key={mascotKey} />
            <Button className="rounded-full" onPress={() => setChatVisible(true)}>
              <Icon as={MessageCircleMore} size={24} />
              <Text>タップしてぼやく</Text>
            </Button>
          </View>
        </View>
      </SafeAreaView>
      <Modal visible={chatVisible} animationType="slide" transparent onRequestClose={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <SafeAreaView className="flex-1 bg-background">
            <View className="flex-row justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                hitSlop={8}
                className="rounded-full"
                onPress={handleClose}
                disabled={isPendingEntry || isPendingReply}
              >
                <Icon as={X} size={32} />
              </Button>
            </View>
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-4"
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map((msg, i) =>
                msg.role === 'user' ? (
                  <UserChat key={i} message={msg.text} />
                ) : (
                  <AIChat
                    key={i}
                    message={msg.text}
                    hideIcon={messages[i - 1]?.role === 'model'}
                    onSelect={(option) => handleSend(option)}
                    disabled={isPendingEntry || isPendingReply}
                  />
                ),
              )}
              {isPendingReply && <AIChat isLoading />}
            </ScrollView>
            <View className="flex-row items-end gap-2 p-4">
              <Textarea
                key={inputKey}
                value={draft}
                onChangeText={setDraft}
                placeholder="いまのぐあい、ぼやいてみてください..."
                className="h-auto min-h-10 flex-1 bg-card"
              />
              <Button
                variant="default"
                size="icon"
                onPress={() => handleSend()}
                disabled={isPendingEntry || isPendingReply}
                className="rounded-full"
              >
                <Icon as={Send} size={22} />
              </Button>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
