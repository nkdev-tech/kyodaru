import { env } from 'cloudflare:workers'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import app from '..'
import { getChatReply } from '../modules/ai/usecase/get-chat-reply'

vi.mock('../modules/ai/usecase/get-chat-reply')

describe('ai', () => {
  beforeEach(() => vi.clearAllMocks())

  it('can get ai reply', async () => {
    vi.mocked(getChatReply).mockResolvedValue({ reply: 'それはつらいですね' })
    const messages = [
      {
        role: 'user' as const,
        text: '今日もだるい',
      },
    ]
    const res = await app.fetch(
      new Request('http://localhost/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      }),
      env,
    )
    expect(res.status).toBe(200)
  })

  it('cannot get ai reply with invalid value', async () => {
    const res = await app.fetch(
      new Request('http://localhost/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      }),
      env,
    )
    expect(res.status).toBe(400)
  })
})
