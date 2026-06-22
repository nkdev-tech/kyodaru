export const apiBaseUrl = (() => {
  const value = process.env.EXPO_PUBLIC_API_URL;
  if (!value) {
    throw new Error('EXPO_PUBLIC_API_URL が設定されていません');
  }
  return value;
})();
