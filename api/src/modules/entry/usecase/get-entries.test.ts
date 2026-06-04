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
        rawText: '今日もだるい',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        id: '2',
        rawText: '頭痛い',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
      },
      {
        id: '3',
        rawText: 'お腹痛い',
        createdAt: new Date('2026-01-03T00:00:00.000Z'),
      },
    ]
    vi.mocked(EntryRepository.findAll).mockResolvedValue(mockEntries)
    const res = await getEntries()
    expect(res).toEqual(mockEntries)
    expect(EntryRepository.findAll).toHaveBeenCalledTimes(1)
  })
})
