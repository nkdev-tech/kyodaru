import type { SelectEntry } from '../entity/entry'
import { EntryRepository } from '../repository/entry-repository'

export async function getEntries(
  userId: string,
  year?: number | null,
  month?: number | null,
): Promise<SelectEntry[]> {
  const nowDate = new Date()
  return await EntryRepository.findAll(
    userId,
    year ?? nowDate.getFullYear(),
    month ?? nowDate.getMonth() + 1,
  )
}
