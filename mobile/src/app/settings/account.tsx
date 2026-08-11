import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { authClient } from '@/lib/auth-client';
import { useClipboard } from '@/hooks/use-clipboard';
import { ChevronLeft, Copy } from 'lucide-react-native';

export default function AccountScreen() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const userId = session?.user.id ?? '';
  const { copyToClipboard } = useClipboard();

  return (
    <SafeAreaView className="mx-5 flex-1 bg-background">
      <View className="my-3 h-8 flex-row items-center gap-2">
        <Button variant="ghost" size="icon" onPress={() => router.back()} className="rounded-full">
          <Icon as={ChevronLeft} size={18} className="text-secondary-foreground" />
        </Button>
        <Text className="font-body-bold text-xl">アカウント設定</Text>
      </View>
      <View className="flex-1 gap-2">
        <Text className="text-secondary-foreground">ユーザーID</Text>
        <Card>
          <CardContent className="flex-row items-center justify-between">
            <Text>{userId}</Text>
            <Button
              variant="ghost"
              size="icon"
              onPress={() => copyToClipboard(userId)}
              className="rounded-full"
            >
              <Icon as={Copy} size={18} className="text-secondary-foreground" />
            </Button>
          </CardContent>
        </Card>
      </View>
    </SafeAreaView>
  );
}
