import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { entryTable } from '../../../db/schema'
import type { InsertEntry, SelectEntry } from '../entity/entry'

export const EntryRepository = {
  async findAll(userId: string): Promise<SelectEntry[]> {
    return await db
      .select()
      .from(entryTable)
      .where(eq(entryTable.userId, userId))
  },
  async create(data: Omit<InsertEntry, 'id'>): Promise<SelectEntry> {
    return await db
      .insert(entryTable)
      .values({ ...data, id: crypto.randomUUID() })
      .returning()
      .get()
  },
}
