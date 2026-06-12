import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const entryTable = sqliteTable('entries', {
  id: text('id').primaryKey(),
  summary: text('summary').notNull(),
  rawText: text('raw_text').notNull(),
  conditionLevel: integer('condition_level').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
})
