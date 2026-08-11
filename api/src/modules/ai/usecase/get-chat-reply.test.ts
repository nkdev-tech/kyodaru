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
    const pressure = 980.2
    const temperature = 18.6
    const weather = '小雨'
    const result = await getChatReply('dummy-key', {
      messages: [
        { role: 'model', text: '今の調子はどうですか？' },
        { role: 'user', text: '頭が痛い' },
      ],
      pressure,
      temperature,
      weather,
    })
    expect(result.reply).toBe('それはつらいですね')
    expect(generateContent.mock.calls[0][0].config.systemInstruction).toContain(
      String(pressure),
    )
    expect(generateContent.mock.calls[0][0].config.systemInstruction).toContain(
      String(temperature),
    )
    expect(generateContent.mock.calls[0][0].config.systemInstruction).toContain(
      weather,
    )
    expect(generateContent.mock.calls[0][0].config.maxOutputTokens).toBe(500)
  })
  it('can get reply without weather information', async () => {
    const generateContent = vi
      .fn()
      .mockResolvedValue({ text: 'それはつらいですね' })
    // biome-ignore lint/complexity/useArrowFunction: vi.mock のコンストラクタモックにはアロー関数不可
    vi.mocked(GoogleGenAI).mockImplementation(function () {
      return { models: { generateContent } } as unknown as GoogleGenAI
    })
    const pressure = null
    const temperature = null
    const weather = null
    const result = await getChatReply('dummy-key', {
      messages: [
        { role: 'model', text: '今の調子はどうですか？' },
        { role: 'user', text: '頭が痛い' },
      ],
      pressure,
      temperature,
      weather,
    })
    expect(result.reply).toBe('それはつらいですね')
    const systemInstruction =
      generateContent.mock.calls[0][0].config.systemInstruction
    expect(systemInstruction).toContain('今の天気: 不明')
    expect(systemInstruction).toContain('今の気温: 不明')
    expect(systemInstruction).toContain('今の気圧: 不明')
    expect(systemInstruction).not.toContain('{{weather}}')
    expect(systemInstruction).not.toContain('{{temperature}}')
    expect(systemInstruction).not.toContain('{{pressure}}')
  })
})
