import type { InsertEntry, SelectEntry } from '../entity/entry'
import { EntryRepository } from '../repository/entry-repository'

export const createEntry = async (
  data: Omit<InsertEntry, 'id'>,
): Promise<SelectEntry> => {
  return await EntryRepository.create(data)
}
