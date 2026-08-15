import { ApiError } from '@google/genai'
import { captureException } from '@sentry/hono/cloudflare'

export function errorLog(e: unknown) {
  const detail = {
    name: e instanceof Error ? e.name : undefined,
    message: e instanceof Error ? e.message : undefined,
    status: e instanceof ApiError ? e.status : undefined,
  }
  captureException(e, { extra: { ...detail } })
  console.error(detail)
}
