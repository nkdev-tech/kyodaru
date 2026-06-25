import { z } from '@hono/zod-openapi'

export const versionCheckSchema = z.boolean().openapi({ example: true })

export const versionErrorSchema = z.object({
  error: z.string().openapi({ example: 'FORCE_UPDATE_REQUIRED' }),
  minVersion: z.string().openapi({ example: '1.0.0' }),
})
