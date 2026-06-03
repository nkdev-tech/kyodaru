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
})
