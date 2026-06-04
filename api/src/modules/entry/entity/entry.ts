import type { entryTable } from '../../../db/schema'

export type SelectEntry = typeof entryTable.$inferSelect
export type InsertEntry = typeof entryTable.$inferInsert
