import { useState } from 'react';
import { Dimensions } from 'react-native';
import { COMPACT_HEIGHT_BREAKPOINT } from '@/lib/config';

// 端末の縦横比変化には追従させず、初回マウント時の高さで一度だけ判定する
export function useIsCompactHeight() {
  const [isCompactHeight] = useState(
    () => Dimensions.get('window').height <= COMPACT_HEIGHT_BREAKPOINT,
  );
  return isCompactHeight;
}
