import { GoogleGenAI } from '@google/genai'
import summaryPrompt from '../prompts/summary.md'

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
  return JSON.parse(response.text)
}
