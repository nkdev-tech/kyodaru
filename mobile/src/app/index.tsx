import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView } from 'react-native';
import { SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { toast } from 'sonner-native';
import {
  useGetApiEntries,
  usePostApiAi,
  usePostApiEntries,
  getGetApiEntriesQueryKey,
} from '@/external/api';
import { AIChat, UserChat } from '@/components/entries/chat';
import { ConditionLabel, Face } from '@/components/entries/condition';
import { Logo } from '@/components/Logo';
import { Mascot } from '@/components/Mascot';
import { WeatherPanel } from '@/components/WeatherPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { useWeather } from '@/hooks/use-weather';
import { CircleQuestionMark, MessageCircleMore, Send, X } from 'lucide-react-native';
import { DAILY_ENTRY_LIMIT } from '@/lib/config';

export default function HomeScreen() {
  const [chatVisible, setChatVisible] = useState(false);
  const [mascotKey, setMascotKey] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [draft, setDraft] = useState('');
  const [inputKey, setInputKey] = useState(0);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>();
  const weatherInfo = useWeather();
  const insets = initialWindowMetrics?.insets ?? { top: 0, bottom: 0, left: 0, right: 0 };
  const queryClient = useQueryClient();
  const today = new Date();
  const { data, isLoading } = useGetApiEntries({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  });
  const { mutate: mutateEntry, isPending: isPendingEntry } = usePostApiEntries();
  const { mutate: mutateReply, isPending: isPendingReply } = usePostApiAi();
  const todayEntries = data?.status === 200 ? data?.data : [];
  const isLimitReached = todayEntries.length >= DAILY_ENTRY_LIMIT;

  useEffect(() => {
    SecureStore.getItemAsync('hasSeenWelcome').then((value) => {
      if (value) {
        setWelcomeMessage(null);
        return;
      }
      setWelcomeMessage('はじめまして、だるくもです\n下のボタンから体調が記録できます');
      SecureStore.setItemAsync('hasSeenWelcome', 'true');
    });
  }, []);

  useEffect(() => {
    if (chatVisible && messages.length === 0) {
      // チャット画面が表示されてから少し遅らせて初期メッセージを出し、
      // AIが返答しているように見せる演出
      const timer = setTimeout(() => {
        setMessages([{ role: 'model', text: '今の調子はどうですか？' }]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [chatVisible, messages]);

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
          pressure: weatherInfo.pressure,
          temperature: weatherInfo.temperature,
          weather: weatherInfo.weather,
        },
      },
      {
        onSuccess(result) {
          if (result.status !== 200) {
            toast.error('送信に失敗しました。もう一度お試しください');
            return;
          }
          const replies = result.data.reply.split('\n\n').filter((t) => t.trim());
          setMessages((prev) => [
            ...prev,
            ...replies.map((text) => ({ role: 'model' as const, text })),
          ]);
        },
        onError() {
          toast.error('送信に失敗しました。もう一度お試しください');
        },
      },
    );
  };

  const handleClose = () => {
    if (isPendingEntry) return;

    setChatVisible(false);
    setDraft('');
    setWelcomeMessage(null);
    setMascotKey((k) => k + 1);

    if (!messages.some((m) => m.role === 'user')) return;

    const answeredMessages = messages.at(-1)?.role === 'model' ? messages.slice(0, -1) : messages;

    mutateEntry(
      {
        data: {
          rawText: answeredMessages
            .map((m) => `${m.role === 'model' ? 'AI' : 'ユーザー'}: ${m.text}`)
            .join('\n\n---\n\n'),
          pressure: weatherInfo.pressure,
          temperature: weatherInfo.temperature,
          weather: weatherInfo.weather,
        },
      },
      {
        onSuccess(result) {
          if (result.status !== 201) {
            toast.error('送信に失敗しました。もう一度お試しください');
            return;
          }
          queryClient.invalidateQueries({ queryKey: getGetApiEntriesQueryKey() });
          setMessages([]);
        },
        onError() {
          toast.error('送信に失敗しました。もう一度お試しください');
        },
      },
    );
  };

  return (
    <>
      <SafeAreaView className="flex-1 bg-background">
        <View className="mx-5 flex-1">
          <View className="my-3 h-8 flex-row items-center">
            <Logo />
          </View>
          <WeatherPanel weatherInfo={weatherInfo} today={today} />
          <View className="mb-24 mt-36 flex-1 items-center justify-center gap-2 bg-transparent">
            {welcomeMessage !== undefined && <Mascot key={mascotKey} message={welcomeMessage} />}
            <View className="items-center gap-2">
              <Text className="text-sm text-destructive">
                {isLimitReached ? '本日の上限に達しました' : ''}
              </Text>
              <Button
                size="lg"
                className="rounded-full"
                disabled={isLoading || isLimitReached}
                onPress={() => setChatVisible(true)}
              >
                <Icon as={MessageCircleMore} size={24} />
                <Text className="font-body-bold text-lg">タップしてぼやく</Text>
              </Button>
              <View className="flex-row items-center gap-1">
                <Text className="text-sm text-muted-foreground">
                  残り {DAILY_ENTRY_LIMIT - todayEntries.length} / {DAILY_ENTRY_LIMIT}回
                </Text>
                <Popover>
                  <PopoverTrigger>
                    <Icon as={CircleQuestionMark} size={16} className="text-muted-foreground" />
                  </PopoverTrigger>
                  <PopoverContent side="top" className="w-auto max-w-xs">
                    <Text className="text-sm">日付が変わるとリセットされます</Text>
                  </PopoverContent>
                </Popover>
              </View>
            </View>
          </View>
          <View className="h-30 flex-1">
            <View className="mb-2 flex-row items-center gap-2">
              <Text className="font-body-medium">今日の記録</Text>
              <Text className="text-sm text-muted-foreground">{todayEntries.length}件</Text>
            </View>
            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-2 pb-2"
              showsVerticalScrollIndicator={false}
            >
              {todayEntries.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="flex-row gap-3">
                    <Face level={entry.conditionLevel} size={40} />
                    <View className="flex-1 gap-1 bg-transparent">
                      <View className="flex-row items-center justify-between bg-transparent">
                        <ConditionLabel level={entry.conditionLevel} />
                        <Text className="text-xs text-muted-foreground">
                          {format(new Date(entry.createdAt), 'HH:mm', { locale: ja })}
                        </Text>
                      </View>
                      <View className="bg-transparent">
                        <Text className="text-sm">{entry.summary}</Text>
                      </View>
                    </View>
                  </CardContent>
                </Card>
              ))}
              {isPendingEntry && (
                <View className="flex-1 items-center justify-center py-2">
                  <ActivityIndicator size="large" />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
      <Modal visible={chatVisible} animationType="slide" transparent onRequestClose={handleClose}>
        <View
          className="flex-1 bg-background"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
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
                disabled={isPendingEntry || isPendingReply || isLoading || isLimitReached}
                className="rounded-full"
              >
                <Icon as={Send} size={22} />
              </Button>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}
