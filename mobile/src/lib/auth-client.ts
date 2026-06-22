import { createAuthClient } from 'better-auth/react';
import { anonymousClient } from 'better-auth/client/plugins';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';
import { apiBaseUrl } from './env';

export const authClient = createAuthClient({
  baseURL: apiBaseUrl,
  plugins: [
    expoClient({
      scheme: 'mobile',
      storagePrefix: 'mobile',
      storage: SecureStore,
    }),
    anonymousClient(),
  ],
});
