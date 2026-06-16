import { z } from '@hono/zod-openapi'

const entrySchema = z.object({
  id: z.string().openapi({ example: '1' }),
  summary: z.string().openapi({ example: 'だるい' }),
  rawText: z.string().openapi({ example: '今日もだるい' }),
  conditionLevel: z.number().openapi({ example: 1 }),
  pressure: z.number().nullable().openapi({ example: 1000 }),
  temperature: z.number().nullable().openapi({ example: 23.5 }),
  weather: z.string().nullable().openapi({ example: '快晴' }),
  createdAt: z
    .date()
    .openapi({ example: new Date('2026-01-01T00:00:00.000Z') }),
})

const inputEntrySchema = z.object({
  rawText: z.string().min(1).openapi({ example: '今日もだるい' }),
  latitude: z.number().optional().openapi({ example: 35.6 }),
  longitude: z.number().optional().openapi({ example: 139.6 }),
})

export const getEntriesSchema = entrySchema.array()
export const createEntryReqSchema = inputEntrySchema
export const createEntryResSchema = entrySchema

export const errorResBodySchema = z.object({
  success: z.boolean(),
  error: z.object({
    name: z.string(),
    message: z.string().openapi({ example: 'Bad Request' }),
  }),
})
