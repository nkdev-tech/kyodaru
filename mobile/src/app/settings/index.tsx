import { Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { PRIVACY_POLICY_URL } from '@/lib/config';
import { ExternalLink, ChevronRight } from 'lucide-react-native';

export default function SettingsTab() {
  return (
    <SafeAreaView className="mx-5 flex-1 bg-background">
      <View className="my-3 h-8 flex-row items-center">
        <Text className="font-body-bold text-xl">設定</Text>
      </View>
      <View className="mb-3 items-center">
        <Image
          source={require('@/assets/images/mascot.png')}
          className="h-20 w-20"
          resizeMode="contain"
        />
        <Text className="text-secondary-foreground">v{Constants.expoConfig?.version}</Text>
      </View>
      <View className="flex-1 gap-2">
        <Text className="text-secondary-foreground">設定</Text>
        <Card>
          <CardContent>
            <Link href="/settings/account" asChild>
              <Pressable className="flex-row items-center justify-between bg-transparent">
                <Text>アカウント設定</Text>
                <Icon as={ChevronRight} size={18} className="text-secondary-foreground" />
              </Pressable>
            </Link>
          </CardContent>
        </Card>
        <Text className="text-secondary-foreground">その他</Text>
        <Card>
          <CardContent>
            <Pressable
              className="flex-row items-center justify-between"
              onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}
            >
              <Text>プライバシーポリシー</Text>
              <Icon as={ExternalLink} size={18} className="text-secondary-foreground" />
            </Pressable>
          </CardContent>
        </Card>
      </View>
    </SafeAreaView>
  );
}
