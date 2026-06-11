import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePostApiAi, usePostApiEntries } from '@/external/api';
import { AIChat, UserChat } from '@/components/entries/chat';
import { Mascot } from '@/components/Mascot';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Textarea } from '@/components/ui/textarea';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { MessageCircleMore, Send, X } from 'lucide-react-native';

export default function HomeScreen() {
  const [chatVisible, setChatVisible] = useState(false);
  const [mascotKey, setMascotKey] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [draft, setDraft] = useState('');
  const [inputKey, setInputKey] = useState(0);
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

  const handleSend = () => {
    if (!draft.trim()) return;
    const newMessage = [...messages, { role: 'user' as const, text: draft.trim() }];
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
        <View className="flex-1 items-center justify-center gap-6">
          <Mascot key={mascotKey} />
          <Button className="rounded-full" onPress={() => setChatVisible(true)}>
            <Icon as={MessageCircleMore} className="text-primary-foreground" />
            <Text>タップしてぼやく</Text>
          </Button>
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
                className="h-12 w-12 rounded-full"
                onPress={handleClose}
                disabled={isPendingEntry || isPendingReply}
              >
                <Icon as={X} className="h-6 w-6" />
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
                  <AIChat key={i} message={msg.text} hideIcon={messages[i - 1]?.role === 'model'} />
                ),
              )}
              {isPendingReply && <AIChat message="..." />}
            </ScrollView>
            <View className="flex-row items-end gap-2 p-4">
              <Textarea
                key={inputKey}
                value={draft}
                onChangeText={setDraft}
                placeholder="いまのぐあい、ぼやいてみてください..."
                className="h-auto min-h-10 flex-1 bg-white"
              />
              <Button
                variant="default"
                size="icon"
                onPress={handleSend}
                disabled={isPendingEntry || isPendingReply}
                className="rounded-full"
              >
                <Icon as={Send} />
              </Button>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
