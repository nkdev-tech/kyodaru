import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import type { AuthType } from '../../lib/auth'
import { createEntry } from '../../modules/entry/usecase/create-entry'
import { getEntries } from '../../modules/entry/usecase/get-entries'
import {
  createEntryReqSchema,
  createEntryResSchema,
  errorResBodySchema,
  getEntriesSchema,
  querySchema,
} from './schema'

const getEntriesRoute = createRoute({
  method: 'get',
  path: '/',
  request: {
    query: querySchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getEntriesSchema,
        },
      },
      description: 'Retrieve Entries',
    },
    401: {
      content: {
        'application/json': {
          schema: errorResBodySchema,
        },
      },
      description: 'Unauthorized',
    },
  },
})

const createEntryRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createEntryReqSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: createEntryResSchema,
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
}>()
  .openapi(getEntriesRoute, async (c) => {
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
    const { year, month } = c.req.valid('query')
    const res = await getEntries(userId, year, month)
    return c.json(res, 200)
  })
  .openapi(createEntryRoute, async (c) => {
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
      const res = await createEntry(userId, c.env.GEMINI_API_KEY, data)
      return c.json(res, 201)
    } catch (e) {
      console.error(e)
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
