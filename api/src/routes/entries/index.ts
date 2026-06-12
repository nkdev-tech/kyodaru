import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { createEntry } from '../../modules/entry/usecase/create-entry'
import { getEntries } from '../../modules/entry/usecase/get-entries'
import {
  createEntryReqSchema,
  createEntryResSchema,
  errorResBodySchema,
  getEntriesSchema,
} from './schema'

const getEntriesRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: getEntriesSchema,
        },
      },
      description: 'Retrieve Entries',
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
  },
})

const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>()
  .openapi(getEntriesRoute, async (c) => {
    const res = await getEntries()
    return c.json(res, 200)
  })
  .openapi(createEntryRoute, async (c) => {
    const data = c.req.valid('json')
    const res = await createEntry(c.env.GEMINI_API_KEY, data)
    return c.json(res, 201)
  })

export default app
