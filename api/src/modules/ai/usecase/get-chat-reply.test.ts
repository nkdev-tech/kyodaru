import { GoogleGenAI } from '@google/genai'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getChatReply } from './get-chat-reply'

vi.mock('@google/genai')

describe('getChatReply', () => {
  beforeEach(() => vi.clearAllMocks())

  it('can get reply', async () => {
    const generateContent = vi
      .fn()
      .mockResolvedValue({ text: 'それはつらいですね' })
    // biome-ignore lint/complexity/useArrowFunction: vi.mock のコンストラクタモックにはアロー関数不可
    vi.mocked(GoogleGenAI).mockImplementation(function () {
      return { models: { generateContent } } as unknown as GoogleGenAI
    })

    const result = await getChatReply('dummy-key', [
      { role: 'model', text: '今日の体調はいかがですか？' },
      { role: 'user', text: '頭が痛い' },
    ])
    expect(result.reply).toBe('それはつらいですね')
  })
})
