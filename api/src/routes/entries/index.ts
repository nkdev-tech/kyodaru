import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { getEntries } from '../../modules/entry/usecase/get-entries'
import { getEntriesSchema } from './schema'

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

const app = new OpenAPIHono().openapi(getEntriesRoute, async (c) => {
  const res = await getEntries()
  return c.json(res, 200)
})

export default app
