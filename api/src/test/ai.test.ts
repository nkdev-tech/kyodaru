import { env } from 'cloudflare:workers'
import { ApiError } from '@google/genai'
import { captureException } from '@sentry/hono/cloudflare'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import app from '..'
import { auth } from '../lib/auth'
import { getChatReply } from '../modules/ai/usecase/get-chat-reply'

vi.mock('../modules/ai/usecase/get-chat-reply')
vi.mock('../lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
    handler: vi.fn(),
  },
}))
vi.mock('@sentry/hono/cloudflare', () => ({
  sentry: () => async (_c: unknown, next: () => Promise<unknown>) => next(),
  captureException: vi.fn(),
  setUser: vi.fn(),
}))

describe('ai', () => {
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

  it('can get ai reply', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
    vi.mocked(getChatReply).mockResolvedValue({ reply: 'それはつらいですね' })
    const messages = [
      {
        role: 'user' as const,
        text: '今日もだるい',
      },
    ]
    const pressure = 980.2
    const temperature = 18.6
    const weather = '小雨'
    const res = await app.fetch(
      new Request('http://localhost/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, pressure, temperature, weather }),
      }),
      { ...env, GEMINI_API_KEY: 'dummy-key' },
    )
    expect(res.status).toBe(200)
    expect(getChatReply).toHaveBeenCalledWith(expect.anything(), {
      messages,
      pressure,
      temperature,
      weather,
    })
  })

  it('cannot get ai reply when message text exceeds max length', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
    const messages = [
      {
        role: 'user' as const,
        text: 'あ'.repeat(1001),
      },
    ]
    const pressure = 980.2
    const temperature = 18.6
    const weather = '小雨'
    const res = await app.fetch(
      new Request('http://localhost/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          pressure,
          temperature,
          weather,
        }),
      }),
      { ...env, GEMINI_API_KEY: 'dummy-key' },
    )
    expect(res.status).toBe(400)
    expect(getChatReply).toHaveBeenCalledTimes(0)
  })

  it('cannot get ai reply when messages count exceeds max length', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
    const messages = Array.from({ length: 41 }, () => ({
      role: 'user' as const,
      text: '今日もだるい',
    }))
    const pressure = 980.2
    const temperature = 18.6
    const weather = '小雨'
    const res = await app.fetch(
      new Request('http://localhost/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          pressure,
          temperature,
          weather,
        }),
      }),
      { ...env, GEMINI_API_KEY: 'dummy-key' },
    )
    expect(res.status).toBe(400)
    expect(getChatReply).toHaveBeenCalledTimes(0)
  })

  it('cannot get ai reply with empty messages', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
    const pressure = 980.2
    const temperature = 18.6
    const weather = '小雨'
    const res = await app.fetch(
      new Request('http://localhost/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], pressure, temperature, weather }),
      }),
      { ...env, GEMINI_API_KEY: 'dummy-key' },
    )
    expect(res.status).toBe(400)
    expect(getChatReply).toHaveBeenCalledTimes(0)
  })

  it('records the error to Sentry and logs it with name/message/status when Gemini API call fails with an ApiError', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const error = new ApiError({ message: 'API key not valid', status: 400 })
    vi.mocked(getChatReply).mockRejectedValue(error)
    const messages = [
      {
        role: 'user' as const,
        text: '今日もだるい',
      },
    ]
    const pressure = 980.2
    const temperature = 18.6
    const weather = '小雨'
    const res = await app.fetch(
      new Request('http://localhost/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, pressure, temperature, weather }),
      }),
      { ...env, GEMINI_API_KEY: 'dummy-key' },
    )
    expect(res.status).toBe(500)
    expect(captureException).toHaveBeenCalledWith(error, {
      extra: {
        name: 'ApiError',
        message: 'API key not valid',
        status: 400,
      },
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith({
      name: 'ApiError',
      message: 'API key not valid',
      status: 400,
    })
  })

  it('logs status as undefined when Gemini API call fails with a non-ApiError', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const error = new Error('unexpected')
    vi.mocked(getChatReply).mockRejectedValue(error)
    const messages = [
      {
        role: 'user' as const,
        text: '今日もだるい',
      },
    ]
    const pressure = 980.2
    const temperature = 18.6
    const weather = '小雨'
    const res = await app.fetch(
      new Request('http://localhost/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, pressure, temperature, weather }),
      }),
      { ...env, GEMINI_API_KEY: 'dummy-key' },
    )
    expect(res.status).toBe(500)
    expect(captureException).toHaveBeenCalledWith(error, {
      extra: {
        name: 'Error',
        message: 'unexpected',
        status: undefined,
      },
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith({
      name: 'Error',
      message: 'unexpected',
      status: undefined,
    })
  })

  it('cannot get ai reply without user', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    const messages = [
      {
        role: 'user' as const,
        text: '今日もだるい',
      },
    ]
    const pressure = 980.2
    const temperature = 18.6
    const weather = '小雨'
    const res = await app.fetch(
      new Request('http://localhost/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, pressure, temperature, weather }),
      }),
      { ...env, GEMINI_API_KEY: 'dummy-key' },
    )
    expect(res.status).toBe(401)
  })
})
