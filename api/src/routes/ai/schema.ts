import { z } from '@hono/zod-openapi'

export const getChatReplyReqSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'model']).openapi({ example: 'user' }),
        text: z.string().min(1).openapi({ example: '今日もだるい' }),
      }),
    )
    .min(1),
  pressure: z.number().nullable().openapi({ example: 1014.9 }),
  temperature: z.number().nullable().openapi({ example: 23.5 }),
  weather: z.string().nullable().openapi({ example: '快晴' }),
})

export const getChatReplyResSchema = z.object({
  reply: z.string().openapi({ example: 'それはつらいですね' }),
})

export const errorResBodySchema = z.object({
  success: z.boolean(),
  error: z.object({
    name: z.string(),
    message: z.string().openapi({ example: 'Bad Request' }),
  }),
})
