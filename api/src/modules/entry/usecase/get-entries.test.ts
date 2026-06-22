import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EntryRepository } from '../repository/entry-repository'
import { getEntries } from './get-entries'

vi.mock('../repository/entry-repository')

describe('getEntries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('can get entries', async () => {
    const mockEntries = [
      {
        id: '1',
        userId: '1',
        summary: 'だるい',
        rawText: '今日もだるい',
        conditionLevel: 4,
        pressure: 1014.9,
        temperature: 23.5,
        weather: '快晴',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: '2',
        userId: '1',
        summary: '頭痛い',
        rawText: '頭痛い。ズキズキとこめかみが痛む。眩暈がする',
        conditionLevel: 5,
        pressure: 998.2,
        temperature: 18.3,
        weather: '雨',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      },
      {
        id: '3',
        userId: '1',
        summary: '普通',
        rawText: '普通。やや肩こりがある',
        conditionLevel: 3,
        pressure: 1008.5,
        temperature: 24.2,
        weather: '曇り',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
      },
    ]
    vi.mocked(EntryRepository.findAll).mockResolvedValue(mockEntries)
    const userId = '1'
    const res = await getEntries(userId)
    expect(res).toEqual(mockEntries)
    expect(EntryRepository.findAll).toHaveBeenCalledWith(userId)
  })
})
