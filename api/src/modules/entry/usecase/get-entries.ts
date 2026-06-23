import type { SelectEntry } from '../entity/entry'
import { EntryRepository } from '../repository/entry-repository'

export async function getEntries(userId: string): Promise<SelectEntry[]> {
  return await EntryRepository.findAll(userId)
}
