import { fetchWeatherApi } from 'openmeteo'
import { summarizeChat } from '../../ai/usecase/summarize-chat'
import type { SelectEntry } from '../entity/entry'
import { EntryRepository } from '../repository/entry-repository'

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
}

async function getWeather(latitude?: number, longitude?: number) {
  if (latitude == null || longitude == null)
    return { pressure: null, temperature: null, weatherCode: null }
  const params = {
    latitude: latitude,
    longitude: longitude,
    current: ['surface_pressure', 'temperature_2m', 'weather_code'],
    timezone: 'Asia/Tokyo',
    forecast_days: 1,
  }
  const url = 'https://api.open-meteo.com/v1/forecast'
  try {
    const responses = await fetchWeatherApi(url, params)

    const current = responses[0].current()
    if (!current)
      return { pressure: null, temperature: null, weatherCode: null }

    const rawPressure = current.variables(0)?.value()
    const rawTemperature = current.variables(1)?.value()

    return {
      pressure: rawPressure != null ? Math.round(rawPressure * 10) / 10 : null,
      temperature:
        rawTemperature != null ? Math.round(rawTemperature * 10) / 10 : null,
      weatherCode: current.variables(2)?.value() ?? null,
    }
  } catch (e) {
    console.error(e)
    return { pressure: null, temperature: null, weatherCode: null }
  }
}

export const createEntry = async (
  apiKey: string,
  data: { rawText: string; latitude?: number; longitude?: number },
): Promise<SelectEntry> => {
  const [{ summary, conditionLevel }, { pressure, temperature, weatherCode }] =
    await Promise.all([
      summarizeChat(apiKey, data.rawText),
      getWeather(data.latitude, data.longitude),
    ])

  const weather =
    weatherCode != null ? (WEATHER_CODE[weatherCode] ?? null) : null

  return await EntryRepository.create({
    rawText: data.rawText,
    summary,
    conditionLevel,
    pressure,
    temperature,
    weather,
  })
}
