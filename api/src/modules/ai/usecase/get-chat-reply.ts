import { GoogleGenAI } from '@google/genai'
import chatPrompt from '../prompts/chat.md'

export const getChatReply = async (
  apiKey: string,
  messages: Array<{ role: 'user' | 'model'; text: string }>,
): Promise<{ reply: string }> => {
  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: messages.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    config: {
      systemInstruction: chatPrompt,
    },
  })
  if (!response.text) {
    throw new Error('No response from AI')
  }
  return { reply: response.text }
}
