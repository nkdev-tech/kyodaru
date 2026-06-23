import type { SelectEntry } from '../entity/entry'
import { EntryRepository } from '../repository/entry-repository'

export async function getEntries(
  userId: string,
  year?: number | null,
  month?: number | null,
): Promise<SelectEntry[]> {
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000)
  return await EntryRepository.findAll(
    userId,
    year ?? nowJst.getUTCFullYear(),
    month ?? nowJst.getUTCMonth() + 1,
  )
}
