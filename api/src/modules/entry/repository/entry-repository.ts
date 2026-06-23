import { and, asc, eq, gte, lt } from 'drizzle-orm'
import { db } from '../../../db'
import { entryTable } from '../../../db/schema'
import type { InsertEntry, SelectEntry } from '../entity/entry'

export const EntryRepository = {
  async findAll(
    userId: string,
    year: number,
    month: number,
  ): Promise<SelectEntry[]> {
    const startDate = new Date(Date.UTC(year, month - 1, 1, -9))
    const endDate = new Date(Date.UTC(year, month, 1, -9))
    return await db
      .select()
      .from(entryTable)
      .where(
        and(
          eq(entryTable.userId, userId),
          gte(entryTable.createdAt, startDate),
          lt(entryTable.createdAt, endDate),
        ),
      )
      .orderBy(asc(entryTable.createdAt))
  },
  async create(data: Omit<InsertEntry, 'id'>): Promise<SelectEntry> {
    return await db
      .insert(entryTable)
      .values({ ...data, id: crypto.randomUUID() })
      .returning()
      .get()
  },
}
