import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'
import summaryPrompt from '../prompts/summary.md'

const responseSchema = z.object({
  summary: z.string(),
  conditionLevel: z.number(),
})

export async function summarizeChat(
  apiKey: string,
  rawText: string,
): Promise<{ summary: string; conditionLevel: number }> {
  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-lite',
    contents: rawText,
    config: {
      systemInstruction: summaryPrompt.replace(
        '{{timestamp}}',
        new Date().toISOString(),
      ),
      responseMimeType: 'application/json',
    },
  })
  if (!response.text) {
    throw new Error('No response from AI')
  }
  try {
    const parsed = JSON.parse(response.text)
    return responseSchema.parse(parsed)
  } catch {
    throw new Error('Invalid response from AI')
  }
}
