import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';

type Props = {
  message: string;
  hideIcon?: boolean;
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

export function AIChat({ message, hideIcon }: Props) {
  return (
    <View className="mb-2 flex-row items-start justify-start gap-2">
      {hideIcon ? (
        <View className="size-8" />
      ) : (
        <Avatar alt="だるくも" className="mt-1.5">
          <AvatarImage source={require('@/assets/images/daru-avatar-circle-128.png')} />
          <AvatarFallback>
            <Text>だ</Text>
          </AvatarFallback>
        </Avatar>
      )}
      <View className="max-w-[76%] rounded-2xl bg-accent px-4 py-3">
        <Text>{message}</Text>
      </View>
    </View>
  );
}
