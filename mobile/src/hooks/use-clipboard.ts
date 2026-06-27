import * as Clipboard from 'expo-clipboard';
import { toast } from 'sonner-native';

export function useClipboard() {
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    toast.success('コピーしました');
  };

  return { copyToClipboard };
}
