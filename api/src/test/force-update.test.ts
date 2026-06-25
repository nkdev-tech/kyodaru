import { env } from 'cloudflare:workers'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import app from '..'
import { auth } from '../lib/auth'

vi.mock('../lib/config', () => ({ MIN_SUPPORTED_APP_VERSION: '10.0.0' }))
vi.mock('../lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
    handler: vi.fn(),
  },
}))

describe('force-update', () => {
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

  it('can get with valid version', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
    const res = await app.fetch(
      new Request('http://localhost/api/version-check', {
        headers: { 'X-App-Version': '10.0.0' },
      }),
      env,
    )
    expect(res.status).toBe(200)
  })

  it('can get without version', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
    const res = await app.fetch(
      new Request('http://localhost/api/version-check'),
      env,
    )
    expect(res.status).toBe(200)
  })

  it('cannot get with invalid version', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    })
    const res = await app.fetch(
      new Request('http://localhost/api/version-check', {
        headers: { 'X-App-Version': '9.0.0' },
      }),
      env,
    )
    expect(res.status).toBe(426)
    expect(await res.json()).toEqual({
      error: 'FORCE_UPDATE_REQUIRED',
      minVersion: '10.0.0',
    })
  })
})
