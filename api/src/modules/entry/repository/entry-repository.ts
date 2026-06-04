import { db } from '../../../db'
import { entryTable } from '../../../db/schema'
import type { InsertEntry, SelectEntry } from '../entity/entry'

export const EntryRepository = {
  findAll: async (): Promise<SelectEntry[]> => {
    return await db.select().from(entryTable)
  },
  create: async (data: Omit<InsertEntry, 'id'>): Promise<SelectEntry> => {
    return await db
      .insert(entryTable)
      .values({ ...data, id: crypto.randomUUID() })
      .returning()
      .get()
  },
}
