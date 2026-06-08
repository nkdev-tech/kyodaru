import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePostApiEntries } from '@/external/api';
import { UserChat } from '@/components/entries/chat';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Textarea } from '@/components/ui/textarea';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { MessageCircleMore, Send, X } from 'lucide-react-native';

export default function HomeScreen() {
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [inputKey, setInputKey] = useState(0);
  const { mutate } = usePostApiEntries();

  const handleSend = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [...prev, draft.trim()]);
    setDraft('');
    setInputKey((k) => k + 1);
  };

  const handleClose = () => {
    if (messages.length === 0) {
      setChatVisible(false);
      return;
    }

    mutate(
      {
        data: {
          rawText: messages.join('\n\n---\n\n'),
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
        <View className="flex-1 items-center justify-center gap-8">
          <Text>☁️</Text>
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
              <Button variant="ghost" size="icon" className="rounded-full" onPress={handleClose}>
                <Icon as={X} />
              </Button>
            </View>
            <ScrollView className="flex-1 px-4">
              {messages.map((msg, i) => (
                <UserChat key={i} message={msg} />
              ))}
            </ScrollView>
            <View className="flex-row items-end gap-2 p-4">
              <Textarea
                key={inputKey}
                value={draft}
                onChangeText={setDraft}
                placeholder="いまのぐあい、ぼやいてみてください..."
                className="h-auto min-h-10 flex-1 bg-white"
              />
              <Button variant="default" size="icon" onPress={handleSend} className="rounded-full">
                <Icon as={Send} />
              </Button>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
