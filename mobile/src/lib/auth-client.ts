import { createAuthClient } from 'better-auth/react';
import { anonymousClient } from 'better-auth/client/plugins';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:8787',
  plugins: [
    expoClient({
      scheme: 'mobile',
      storagePrefix: 'mobile',
      storage: SecureStore,
    }),
    anonymousClient(),
  ],
});
