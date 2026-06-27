import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { toast } from 'sonner-native';

export function useClipboad() {
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    toast.success('コピーしました');
  };

  const fetchCopiedText = async () => {
    const text = await Clipboard.getStringAsync();
    setCopiedText(text);
  };

  return { copiedText, copyToClipboard, fetchCopiedText };
}
