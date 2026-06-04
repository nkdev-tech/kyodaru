import { testClient } from 'hono/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppType } from '..'
import app from '..'
import { EntryRepository } from '../modules/entry/repository/entry-repository'

vi.mock('../modules/entry/repository/entry-repository')

describe('entries', () => {
  beforeEach(() => vi.clearAllMocks())

  const client = testClient<AppType>(app)

  it('can get entries', async () => {
    vi.mocked(EntryRepository.findAll).mockResolvedValue([])
    const res = await client.api.entries.$get()
    expect(res.status).toBe(200)
  })

  it('can create entry', async () => {
    const mockEntry = {
      id: '1',
      rawText: '今日もだるい',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    }
    vi.mocked(EntryRepository.create).mockResolvedValue(mockEntry)
    const res = await client.api.entries.$post({
      json: {
        rawText: '今日もだるい',
      },
    })
    expect(res.status).toBe(201)
  })

  it('cannnot create entry with invalid value', async () => {
    const res = await client.api.entries.$post({
      json: {
        rawText: '',
      },
    })
    expect(res.status).toBe(400)
  })
})
