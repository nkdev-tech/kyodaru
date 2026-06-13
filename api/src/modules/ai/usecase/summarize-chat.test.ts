import { GoogleGenAI } from '@google/genai'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { summarizeChat } from './summarize-chat'

vi.mock('@google/genai')

describe('summarizeChat', () => {
  beforeEach(() => vi.clearAllMocks())

  it('can get summary', async () => {
    const generateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        summary: '頭全体がぼんやり痛む。立ち上がると目眩がする',
        conditionLevel: 4,
      }),
    })
    // biome-ignore lint/complexity/useArrowFunction: vi.mock のコンストラクタモックにはアロー関数不可
    vi.mocked(GoogleGenAI).mockImplementation(function () {
      return { models: { generateContent } } as unknown as GoogleGenAI
    })

    const result = await summarizeChat(
      'dummy-key',
      'AI: 今日の体調はどうですか？\n\n---\n\nユーザー: 頭が痛いAI: それはつらいですね。どのように痛みますか？A. こめかみがきりきり痛む B. 頭全体がぼやっと痛む C. 血液がどくどくするように痛む\n\n---\n\nユーザー: 頭全体がぼやっと痛む\n\n---\n\nAI: 頭全体がぼんやり重い感じですね。かなり強い痛みですか、それとも鈍い感じですか？\n\n---\n\nユーザー: 鈍い感じ\n\n---\n\nAI: 大変でしたね。他に気になる症状はありますか？\n\n---\n\nユーザー: 眩暈がする\n\n---\n\nAI: 頭痛に眩暈も重なっているんですね。眩暈はどんな感じですか？A. ぐるぐると回る感じ B. ふわふわと浮く感じ C. 立ち上がると一瞬くらっとする感じ\n\n---\n\nユーザー: 立ち上がると一瞬くらっとする感じ',
    )
    expect(result).toEqual({
      summary: '頭全体がぼんやり痛む。立ち上がると目眩がする',
      conditionLevel: 4,
    })
  })
})
