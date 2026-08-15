import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import type { AuthType } from '../../lib/auth'
import { errorLog } from '../../lib/error'
import { getChatReply } from '../../modules/ai/usecase/get-chat-reply'
import {
  errorResBodySchema,
  getChatReplyReqSchema,
  getChatReplyResSchema,
} from './schema'

const getChatReplyRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: getChatReplyReqSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getChatReplyResSchema,
        },
      },
      description: 'AI reply',
    },
    400: {
      content: {
        'application/json': {
          schema: errorResBodySchema,
        },
      },
      description: 'Bad Request',
    },
    401: {
      content: {
        'application/json': {
          schema: errorResBodySchema,
        },
      },
      description: 'Unauthorized',
    },
    500: {
      content: {
        'application/json': {
          schema: errorResBodySchema,
        },
      },
      description: 'Internal Server Error',
    },
  },
})

const app = new OpenAPIHono<{
  Bindings: CloudflareBindings
  Variables: AuthType
}>().openapi(getChatReplyRoute, async (c) => {
  const userId = c.get('user')?.id
  if (userId == null) {
    return c.json(
      {
        success: false,
        error: {
          name: 'Unauthorized',
          message: '認証情報がありません',
        },
      },
      401,
    )
  }
  const data = c.req.valid('json')
  try {
    const res = await getChatReply(c.env.GEMINI_API_KEY, data)
    return c.json(res, 200)
  } catch (e) {
    errorLog(e)
    return c.json(
      {
        success: false,
        error: {
          name: 'Internal Server Error',
          message: 'サーバーエラーが発生しました',
        },
      },
      500,
    )
  }
})

export default app
