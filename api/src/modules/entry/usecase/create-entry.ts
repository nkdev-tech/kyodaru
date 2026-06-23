import { summarizeChat } from '../../ai/usecase/summarize-chat'
import type { SelectEntry } from '../entity/entry'
import { EntryRepository } from '../repository/entry-repository'

export async function createEntry(
  userId: string,
  apiKey: string,
  data: {
    rawText: string
    pressure?: number | null
    temperature?: number | null
    weather?: string | null
  },
): Promise<SelectEntry> {
  const { summary, conditionLevel } = await summarizeChat(apiKey, data.rawText)

  return await EntryRepository.create({
    userId,
    rawText: data.rawText,
    summary,
    conditionLevel,
    pressure: data.pressure ?? null,
    temperature: data.temperature ?? null,
    weather: data.weather ?? null,
  })
}
