import { beforeEach, describe, expect, it, vi } from 'vitest'
import { summarizeChat } from '../../ai/usecase/summarize-chat'
import { EntryRepository } from '../repository/entry-repository'
import { createEntry } from './create-entry'

vi.mock('../repository/entry-repository')
vi.mock('../../ai/usecase/summarize-chat')

describe('createEntry', () => {
  beforeEach(() => vi.clearAllMocks())

  it('can create entry', async () => {
    vi.mocked(summarizeChat).mockResolvedValue({
      summary: 'だるい',
      conditionLevel: 4,
    })
    const mockEntry = {
      id: '1',
      userId: '1',
      summary: 'だるい',
      rawText: '今日もだるい',
      conditionLevel: 4,
      pressure: 1014.9,
      temperature: 23.5,
      weather: '快晴',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    vi.mocked(EntryRepository.create).mockResolvedValue(mockEntry)
    const userId = '1'
    const data = {
      rawText: '今日もだるい',
      pressure: 1014.9,
      temperature: 23.5,
      weather: '快晴',
    }
    const res = await createEntry(userId, 'dummy-key', data)
    expect(res).toEqual(mockEntry)
    expect(EntryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        summary: 'だるい',
        rawText: '今日もだるい',
        conditionLevel: 4,
        pressure: 1014.9,
        temperature: 23.5,
        weather: '快晴',
      }),
    )
  })

  it('can create entry without weather information', async () => {
    vi.mocked(summarizeChat).mockResolvedValue({
      summary: 'だるい',
      conditionLevel: 4,
    })
    const mockEntry = {
      id: '1',
      userId: '1',
      summary: 'だるい',
      rawText: '今日もだるい',
      conditionLevel: 4,
      pressure: null,
      temperature: null,
      weather: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    vi.mocked(EntryRepository.create).mockResolvedValue(mockEntry)
    const userId = '1'
    const data = {
      rawText: '今日もだるい',
      pressure: undefined,
      temperature: undefined,
      weather: undefined,
    }
    const res = await createEntry(userId, 'dummy-key', data)
    expect(res).toEqual(mockEntry)
    expect(EntryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
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
