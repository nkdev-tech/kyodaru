import type { SelectEntry } from '../entity/entry'
import { EntryRepository } from '../repository/entry-repository'

export const getEntries = async (userId: string): Promise<SelectEntry[]> => {
  return await EntryRepository.findAll(userId)
}
