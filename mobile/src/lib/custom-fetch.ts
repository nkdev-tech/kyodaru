import { authClient } from './auth-client';
import { apiBaseUrl } from './env';
import Constants from 'expo-constants';

function getHeaders(headers?: HeadersInit): HeadersInit {
  return {
    ...headers,
    Cookie: authClient.getCookie(),
  };
}

export async function customFetch<T>(url: string, options: RequestInit): Promise<T> {
  const requestInit: RequestInit = {
    ...options,
    headers: getHeaders({ ...options.headers, 'X-App-Version': Constants.expoConfig?.version ?? '0.0.0' }),
  };

  const request = new Request(`${apiBaseUrl}${url}`, requestInit);
  const response = await fetch(request);

  const contentType = response.headers.get('content-type');
  const body = contentType?.includes('application/json')
    ? await response.json()
    : await response.text();

  return { status: response.status, data: body, headers: response.headers } as T;
}
