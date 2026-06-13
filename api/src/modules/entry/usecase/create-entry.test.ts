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
      summary: '頭全体がぼんやり痛む。立ち上がると目眩がする',
      conditionLevel: 4,
    })
    const mockEntry = {
      id: '1',
      summary: 'だるい',
      rawText: '今日もだるい',
      conditionLevel: 4,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    vi.mocked(EntryRepository.create).mockResolvedValue(mockEntry)
    const data = {
      rawText: '今日もだるい',
    }
    const res = await createEntry('dummy-key', data)
    expect(res).toEqual(mockEntry)
    expect(EntryRepository.create).toHaveBeenCalledTimes(1)
  })
})
