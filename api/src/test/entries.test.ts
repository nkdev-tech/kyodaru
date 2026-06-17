import { env } from 'cloudflare:workers'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import app from '..'
import { summarizeChat } from '../modules/ai/usecase/summarize-chat'
import { EntryRepository } from '../modules/entry/repository/entry-repository'

vi.mock('../modules/entry/repository/entry-repository')
vi.mock('../modules/ai/usecase/summarize-chat')

describe('entries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('can get entries', async () => {
    vi.mocked(EntryRepository.findAll).mockResolvedValue([])
    const res = await app.fetch(new Request('http://localhost/api/entries'))
    expect(res.status).toBe(200)
  })

  it('can create entry', async () => {
    vi.mocked(summarizeChat).mockResolvedValue({
      summary: 'だるい',
      conditionLevel: 4,
    })
    const mockEntry = {
      id: '1',
      summary: 'だるい',
      rawText: '今日もだるい',
      conditionLevel: 4,
      pressure: 1014.9,
      temperature: 23.5,
      weather: '快晴',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    vi.mocked(EntryRepository.create).mockResolvedValue(mockEntry)
    const res = await app.fetch(
      new Request('http://localhost/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: '今日もだるい',
          pressure: 1014.9,
          temperature: 23.5,
          weather: '快晴',
        }),
      }),
      env,
    )
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toEqual({
      ...mockEntry,
      createdAt: mockEntry.createdAt.toISOString(),
    })
    expect(EntryRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: 'だるい',
        rawText: '今日もだるい',
        conditionLevel: 4,
        pressure: 1014.9,
        temperature: 23.5,
        weather: '快晴',
      }),
    )
  })

  it('cannnot create entry with invalid value', async () => {
    const res = await app.fetch(
      new Request('http://localhost/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: '',
          pressure: 1014.9,
          temperature: 23.5,
          weather: '快晴',
        }),
      }),
      env,
    )
    expect(res.status).toBe(400)
  })
})
