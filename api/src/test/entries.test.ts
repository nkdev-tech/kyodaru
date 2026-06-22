import { env } from 'cloudflare:workers'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import app from '..'
import { auth } from '../lib/auth'
import { summarizeChat } from '../modules/ai/usecase/summarize-chat'
import { EntryRepository } from '../modules/entry/repository/entry-repository'

vi.mock('../modules/entry/repository/entry-repository')
vi.mock('../modules/ai/usecase/summarize-chat')
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
    vi.mocked(EntryRepository.findAll).mockResolvedValue([])
    const res = await app.fetch(new Request('http://localhost/api/entries'))
    expect(res.status).toBe(200)
  })

  it('cannot get entries without user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    vi.mocked(EntryRepository.findAll).mockResolvedValue([])
    const res = await app.fetch(new Request('http://localhost/api/entries'))
    expect(res.status).toBe(401)
  })

  it('can create entry', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
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
        userId: '1',
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
      env,
    )
    expect(res.status).toBe(400)
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
  })
})
