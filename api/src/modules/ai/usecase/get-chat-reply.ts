import { GoogleGenAI } from '@google/genai'
import type { z } from '@hono/zod-openapi'
import type { getChatReplyReqSchema } from '../../../routes/ai/schema'
import chatPrompt from '../prompts/chat.md'

export const getChatReply = async (
  apiKey: string,
  messages: z.infer<typeof getChatReplyReqSchema>['messages'],
): Promise<{ reply: string }> => {
  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    config: {
      systemInstruction: chatPrompt.replace(
        '{{timestamp}}',
        new Date().toISOString(),
      ),
    },
  })
  if (!response.text) {
    throw new Error('No response from AI')
  }
  return { reply: response.text }
}
