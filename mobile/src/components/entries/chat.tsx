import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { Leader } from '@/components/ui/leader';

type Props = {
  message?: string;
  hideIcon?: boolean;
  onSelect?: (option: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export function UserChat({ message }: Props) {
  return (
    <View className="mb-2 items-end">
      <Card className="max-w-[76%]">
        <CardContent>
          <Text>{message}</Text>
        </CardContent>
      </Card>
    </View>
  );
}

function separateOptions(message?: string): { text: string; options: string[] } {
  if (!message) return { text: '', options: [] };

  const matches = [...message.matchAll(/([A-Z])\.\s*/g)];

  const firstA = matches.findIndex((m) => m[1] === 'A');
  if (firstA === -1) return { text: message, options: [] };

  const sequential = [matches[firstA]];
  for (let i = firstA + 1; i < matches.length; i++) {
    const expected = String.fromCharCode('A'.charCodeAt(0) + sequential.length);
    if (matches[i][1] === expected) sequential.push(matches[i]);
    else break;
  }

  if (sequential.length < 2) return { text: message, options: [] };

  const text = message.slice(0, sequential[0].index).trim();
  const options = sequential.map((m, i) => {
    const start = m.index! + m[0].length;
    const end = sequential[i + 1]?.index ?? message.length;
    return message.slice(start, end).trim();
  });

  return { text, options };
}

export function AIChat({ message, hideIcon, onSelect, disabled, isLoading }: Props) {
  const { text, options } = separateOptions(message);
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
      <Card className="max-w-[76%] bg-accent">
        <CardContent className="gap-1">
          {isLoading ? <Leader /> : text && <Text>{text}</Text>}
          {options.map((option, i) => {
            return (
              <Button
                key={i}
                variant="outline"
                className="h-auto"
                onPress={() => onSelect?.(option)}
                disabled={disabled}
              >
                <Text>{option}</Text>
              </Button>
            );
          })}
        </CardContent>
      </Card>
    </View>
  );
}
