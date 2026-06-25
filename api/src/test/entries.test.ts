import { env } from 'cloudflare:workers'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import app from '..'
import { auth } from '../lib/auth'
import {
  createEntry,
  EntriesLimitError,
} from '../modules/entry/usecase/create-entry'
import { getEntries } from '../modules/entry/usecase/get-entries'

vi.mock('../modules/entry/usecase/get-entries')
vi.mock('../modules/entry/usecase/create-entry')
vi.mock('../lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
    handler: vi.fn(),
  },
}))

describe('entries', () => {
  beforeEach(() => vi.clearAllMocks())
  const mockUser = {
    id: '1',
    name: 'Anonymous',
    email: 'test@example.com',
    emailVerified: false,
    image: null,
    isAnonymous: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const mockSession = {
    id: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: '1',
    expiresAt: new Date(),
    token: 'token',
  }

  it('can get entries', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
    vi.mocked(getEntries).mockResolvedValue([])
    const res = await app.fetch(new Request('http://localhost/api/entries'))
    expect(res.status).toBe(200)
    expect(getEntries).toHaveBeenCalledWith(
      '1',
      undefined,
      undefined,
      undefined,
    )
  })

  it('can get entries with year and month', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
    vi.mocked(getEntries).mockResolvedValue([])
    const res = await app.fetch(
      new Request('http://localhost/api/entries?year=2026&month=1'),
    )
    expect(res.status).toBe(200)
    expect(getEntries).toHaveBeenCalledWith('1', 2026, 1, undefined)
  })

  it('can get entries with year and month and day', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
    vi.mocked(getEntries).mockResolvedValue([])
    const res = await app.fetch(
      new Request('http://localhost/api/entries?year=2026&month=1&day=1'),
    )
    expect(res.status).toBe(200)
    expect(getEntries).toHaveBeenCalledWith('1', 2026, 1, 1)
  })

  it('cannot get entries without user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    const res = await app.fetch(new Request('http://localhost/api/entries'))
    expect(res.status).toBe(401)
  })

  it('can create entry', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
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
    vi.mocked(createEntry).mockResolvedValue(mockEntry)
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
      { ...env, GEMINI_API_KEY: 'dummy-key' },
    )
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body).toEqual({
      ...mockEntry,
      createdAt: mockEntry.createdAt.toISOString(),
    })
    expect(createEntry).toHaveBeenCalledWith('1', 'dummy-key', {
      rawText: '今日もだるい',
      pressure: 1014.9,
      temperature: 23.5,
      weather: '快晴',
    })
  })

  it('cannnot create entry with invalid value', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
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
      { ...env, GEMINI_API_KEY: 'dummy-key' },
    )
    expect(res.status).toBe(400)
    expect(createEntry).toHaveBeenCalledTimes(0)
  })

  it('cannot create entry without user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
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
    expect(res.status).toBe(401)
    expect(createEntry).toHaveBeenCalledTimes(0)
  })

  it('cannot create entry because the daily limit has been reached', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
    vi.mocked(createEntry).mockRejectedValue(new EntriesLimitError())
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
      { ...env, GEMINI_API_KEY: 'dummy-key' },
    )
    expect(res.status).toBe(429)
    expect(createEntry).toHaveBeenCalledWith('1', 'dummy-key', {
      rawText: '今日もだるい',
      pressure: 1014.9,
      temperature: 23.5,
      weather: '快晴',
    })
  })
})
