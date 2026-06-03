import { z } from '@hono/zod-openapi'

const entrySchema = z.object({
  id: z.string().openapi({ example: '1' }),
  rawText: z.string().openapi({ example: '今日もだるい' }),
  createdAt: z
    .date()
    .openapi({ example: new Date('2026-01-01T00:00:00.000Z') }),
})

export const getEntriesSchema = entrySchema.array()
