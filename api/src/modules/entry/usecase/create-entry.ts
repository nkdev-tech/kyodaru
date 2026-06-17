import { summarizeChat } from '../../ai/usecase/summarize-chat'
import type { SelectEntry } from '../entity/entry'
import { EntryRepository } from '../repository/entry-repository'

export const createEntry = async (
  apiKey: string,
  data: {
    rawText: string
    pressure?: number
    temperature?: number
    weather?: string
  },
): Promise<SelectEntry> => {
  const { summary, conditionLevel } = await summarizeChat(apiKey, data.rawText)

  return await EntryRepository.create({
    rawText: data.rawText,
    summary,
    conditionLevel,
    pressure: data.pressure ?? null,
    temperature: data.temperature ?? null,
    weather: data.weather ?? null,
  })
}
