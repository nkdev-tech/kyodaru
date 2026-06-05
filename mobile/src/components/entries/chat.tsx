import { View } from 'react-native';
import { Text } from '@/components/ui/text';

type Props = {
  message: string;
};

export function UserChat({ message }: Props) {
  return (
    <View className="mb-2 items-end">
      <View className="max-w-[76%] rounded-2xl bg-white px-4 py-3">
        <Text>{message}</Text>
      </View>
    </View>
  );
}

export function AIChat({ message }: Props) {
  return (
    <View className="mb-2 items-start">
      <View className="max-w-[76%] rounded-2xl bg-accent px-4 py-3">
        <Text>{message}</Text>
      </View>
    </View>
  );
}
