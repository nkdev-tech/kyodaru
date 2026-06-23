import { GoogleGenAI } from '@google/genai'
import type { z } from '@hono/zod-openapi'
import type { getChatReplyReqSchema } from '../../../routes/ai/schema'
import chatPrompt from '../prompts/chat.md'

export async function getChatReply(
  apiKey: string,
  data: z.infer<typeof getChatReplyReqSchema>,
): Promise<{ reply: string }> {
  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: data.messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    config: {
      systemInstruction: chatPrompt
        .replace('{{timestamp}}', () => new Date().toISOString())
        .replace('{{pressure}}', () =>
          data.pressure != null ? String(data.pressure) : '不明',
        )
        .replace('{{temperature}}', () =>
          data.temperature != null ? String(data.temperature) : '不明',
        )
        .replace('{{weather}}', () => data.weather ?? '不明'),
    },
  })
  if (!response.text) {
    throw new Error('No response from AI')
  }
  return { reply: response.text }
}
