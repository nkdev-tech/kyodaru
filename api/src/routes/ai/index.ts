import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
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
      description: 'Create a entry',
    },
    400: {
      content: {
        'application/json': {
          schema: errorResBodySchema,
        },
      },
      description: 'Bad Request',
    },
  },
})

const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>().openapi(
  getChatReplyRoute,
  async (c) => {
    const data = c.req.valid('json')
    const res = await getChatReply(c.env.GEMINI_API_KEY, data.messages)
    return c.json(res, 200)
  },
)

export default app
