import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EntryRepository } from '../repository/entry-repository'
import { createEntry } from './create-entry'

vi.mock('../repository/entry-repository')

describe('createEntry', () => {
  beforeEach(() => vi.clearAllMocks())

  it('can create entries', async () => {
    const mockEntry = {
      id: '1',
      rawText: '今日もだるい',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    vi.mocked(EntryRepository.create).mockResolvedValue(mockEntry)
    const data = {
      rawText: '今日もだるい',
    }
    const res = await createEntry(data)
    expect(res).toEqual(mockEntry)
    expect(EntryRepository.create).toHaveBeenCalledTimes(1)
  })
})
