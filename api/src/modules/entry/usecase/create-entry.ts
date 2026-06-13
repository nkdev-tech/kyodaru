import { summarizeChat } from '../../ai/usecase/summarize-chat'
import type { InsertEntry, SelectEntry } from '../entity/entry'
import { EntryRepository } from '../repository/entry-repository'

export const createEntry = async (
  apiKey: string,
  data: Pick<InsertEntry, 'rawText'>,
): Promise<SelectEntry> => {
  const { summary, conditionLevel } = await summarizeChat(apiKey, data.rawText)
  return await EntryRepository.create({
    ...data,
    summary,
    conditionLevel,
  })
}
