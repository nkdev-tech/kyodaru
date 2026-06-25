import { DAILY_ENTRY_LIMIT } from '../../../lib/config'
import { summarizeChat } from '../../ai/usecase/summarize-chat'
import type { SelectEntry } from '../entity/entry'
import { EntryRepository } from '../repository/entry-repository'

export class EntriesLimitError extends Error {}

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
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const todayEntries = await EntryRepository.findAll(
    userId,
    nowJst.getUTCFullYear(),
    nowJst.getUTCMonth() + 1,
    nowJst.getUTCDate(),
  )
  if (todayEntries.length >= DAILY_ENTRY_LIMIT) throw new EntriesLimitError()

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
