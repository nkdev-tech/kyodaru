import type { WeatherApiResponse } from '@openmeteo/sdk/weather-api-response'
import { fetchWeatherApi } from 'openmeteo'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { summarizeChat } from '../../ai/usecase/summarize-chat'
import { EntryRepository } from '../repository/entry-repository'
import { createEntry } from './create-entry'

vi.mock('../repository/entry-repository')
vi.mock('../../ai/usecase/summarize-chat')
vi.mock('openmeteo')

describe('createEntry', () => {
  beforeEach(() => vi.clearAllMocks())

  it('can create entry', async () => {
    const pressure = 1000
    const temperature = 23.45
    const weatherCode = 0
    vi.mocked(fetchWeatherApi).mockResolvedValue([
      {
        current: () => ({
          variables: (i: number) => ({
            value: () => [pressure, temperature, weatherCode][i],
          }),
        }),
      } as unknown as WeatherApiResponse,
    ])
    vi.mocked(summarizeChat).mockResolvedValue({
      summary: 'だるい',
      conditionLevel: 4,
    })
    const mockEntry = {
      id: '1',
      summary: 'だるい',
      rawText: '今日もだるい',
      conditionLevel: 4,
      pressure: 1000,
      temperature: 23.5,
      weather: '快晴',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    vi.mocked(EntryRepository.create).mockResolvedValue(mockEntry)
    const data = {
      rawText: '今日もだるい',
      latitude: 35.6,
      longitude: 139.6,
    }
    const res = await createEntry('dummy-key', data)
    expect(res).toEqual(mockEntry)
    expect(EntryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: 'だるい',
        rawText: '今日もだるい',
        conditionLevel: 4,
        pressure: 1000,
        temperature: 23.5,
        weather: '快晴',
      }),
    )
  })

  it('can create entry withaout latitude and longitude', async () => {
    vi.mocked(summarizeChat).mockResolvedValue({
      summary: 'だるい',
      conditionLevel: 4,
    })
    const mockEntry = {
      id: '1',
      summary: 'だるい',
      rawText: '今日もだるい',
      conditionLevel: 4,
      pressure: 1000,
      temperature: 23.5,
      weather: '快晴',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    vi.mocked(EntryRepository.create).mockResolvedValue(mockEntry)
    const data = {
      rawText: '今日もだるい',
      latitude: undefined,
      longitude: undefined,
    }
    const res = await createEntry('dummy-key', data)
    expect(res).toEqual(mockEntry)
    expect(EntryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: 'だるい',
        rawText: '今日もだるい',
        conditionLevel: 4,
        pressure: null,
        temperature: null,
        weather: null,
      }),
    )
  })

  it('can create entry with API error', async () => {
    vi.mocked(fetchWeatherApi).mockResolvedValue({
      error: true,
      reason:
        'Cannot initialize WeatherVariable from invalid String value tempeture_2m for key hourly',
    } as unknown as WeatherApiResponse[])
    vi.mocked(summarizeChat).mockResolvedValue({
      summary: 'だるい',
      conditionLevel: 4,
    })
    const mockEntry = {
      id: '1',
      summary: 'だるい',
      rawText: '今日もだるい',
      conditionLevel: 4,
      pressure: 1000,
      temperature: 23.5,
      weather: '快晴',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    vi.mocked(EntryRepository.create).mockResolvedValue(mockEntry)
    const data = {
      rawText: '今日もだるい',
      latitude: 35.6,
      longitude: 139.6,
    }
    const res = await createEntry('dummy-key', data)
    expect(res).toEqual(mockEntry)
    expect(EntryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: 'だるい',
        rawText: '今日もだるい',
        conditionLevel: 4,
        pressure: null,
        temperature: null,
        weather: null,
      }),
    )
  })
})
