import { db } from '../../../db'
import { entryTable } from '../../../db/schema'
import type { SelectEntry } from '../entity/entry'

export const EntryRepository = {
  findAll: async (): Promise<SelectEntry[]> => {
    return await db.select().from(entryTable)
  },
}
