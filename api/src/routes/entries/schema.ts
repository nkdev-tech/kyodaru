import { z } from '@hono/zod-openapi'

const entrySchema = z.object({
  id: z.string().openapi({ example: '1' }),
  summary: z.string().openapi({ example: 'だるい' }),
  rawText: z.string().openapi({ example: '今日もだるい' }),
  conditionLevel: z.number().openapi({ example: 1 }),
  pressure: z.number().nullable().openapi({ example: 1014.9 }),
  temperature: z.number().nullable().openapi({ example: 23.5 }),
  weather: z.string().nullable().openapi({ example: '快晴' }),
  createdAt: z
    .date()
    .openapi({ example: new Date('2026-01-01T00:00:00.000Z') }),
})

const inputEntrySchema = z.object({
  rawText: z.string().min(1).max(50000).openapi({ example: '今日もだるい' }),
  pressure: z.number().nullable().optional().openapi({ example: 1014.9 }),
  temperature: z.number().nullable().optional().openapi({ example: 23.5 }),
  weather: z.string().nullable().optional().openapi({ example: '快晴' }),
})

export const getEntriesSchema = entrySchema.array()
export const createEntryReqSchema = inputEntrySchema
export const createEntryResSchema = entrySchema

export const querySchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(2000)
    .max(2100)
    .optional()
    .openapi({ example: 2026 }),
  month: z.coerce
    .number()
    .int()
    .min(1)
    .max(12)
    .optional()
    .openapi({ example: 1 }),
  day: z.coerce
    .number()
    .int()
    .min(1)
    .max(31)
    .optional()
    .openapi({ example: 1 }),
})

export const errorResBodySchema = z.object({
  success: z.boolean(),
  error: z.object({
    name: z.string(),
    message: z.string().openapi({ example: 'Bad Request' }),
  }),
})
