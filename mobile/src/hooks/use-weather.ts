import * as Location from 'expo-location';
import { fetchWeatherApi } from 'openmeteo';
import { useEffect, useState } from 'react';

const WEATHER_CODE: Record<number, string> = {
  0: '快晴',
  1: '晴れ',
  2: '薄曇り',
  3: 'くもり',
  45: '霧',
  48: '霧',
  51: '霧雨',
  53: '霧雨',
  55: '霧雨',
  61: '小雨',
  63: '雨',
  65: '大雨',
  71: '小雪',
  73: '雪',
  75: '大雪',
  77: 'あられ',
  80: 'にわか雨',
  81: 'にわか雨',
  82: 'にわか雨',
  85: 'にわか雪',
  86: 'にわか雪',
  95: '雷雨',
  96: '雷雨',
  99: 'ひょう',
};

async function getWeather(latitude?: number, longitude?: number) {
  if (latitude == null || longitude == null)
    return { pressure: null, temperature: null, weather: null };
  const params = {
    latitude: latitude,
    longitude: longitude,
    current: ['surface_pressure', 'temperature_2m', 'weather_code'],
    timezone: 'Asia/Tokyo',
    forecast_days: 1,
  };
  const url = 'https://api.open-meteo.com/v1/forecast';
  try {
    const responses = await fetchWeatherApi(url, params);

    const current = responses[0].current();
    if (!current) return { pressure: null, temperature: null, weather: null };

    const rawPressure = current.variables(0)?.value();
    const rawTemperature = current.variables(1)?.value();
    const rawWeatherCode = current.variables(2)?.value();
    const weather = rawWeatherCode != null ? (WEATHER_CODE[rawWeatherCode] ?? null) : null;

    return {
      pressure: rawPressure != null ? Math.round(rawPressure * 10) / 10 : null,
      temperature: rawTemperature != null ? Math.round(rawTemperature * 10) / 10 : null,
      weather,
    };
  } catch (e) {
    console.error(e);
    return { pressure: null, temperature: null, weather: null };
  }
}

export function useWeather() {
  const [weatherInfo, setWeatherInfo] = useState<{
    pressure: number | null;
    temperature: number | null;
    weather: string | null;
  }>({ pressure: null, temperature: null, weather: null });

  useEffect(() => {
    async function getCurrentLocation() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        let currentLocation = await Location.getCurrentPositionAsync({});

        const { pressure, temperature, weather } = await getWeather(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
        );
        setWeatherInfo({ pressure, temperature, weather });
      } catch (e) {
        console.error(e);
        return;
      }
    }

    getCurrentLocation();
  }, []);

  return weatherInfo;
}
