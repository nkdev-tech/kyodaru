import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import semver from 'semver'
import { MIN_SUPPORTED_APP_VERSION } from '../../lib/config'
import { errorResBodySchema, versionCheckSchema } from './schema'

const versionCheckRoute = createRoute({
  method: 'get',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: versionCheckSchema,
        },
      },
      description: '',
    },
    426: {
      content: {
        'application/json': {
          schema: errorResBodySchema,
        },
      },
      description: '',
    },
  },
})

const app = new OpenAPIHono<{ Bindings: CloudflareBindings }>().openapi(
  versionCheckRoute,
  async (c) => {
    const version = c.req.raw.headers.get('X-App-Version')
    if (!version) {
      return c.json(true, 200)
    }
    if (semver.lt(version, MIN_SUPPORTED_APP_VERSION)) {
      return c.json(
        {
          error: 'FORCE_UPDATE_REQUIRED',
          minVersion: MIN_SUPPORTED_APP_VERSION,
        },
        426,
      )
    }
    return c.json(true, 200)
  },
)

export default app
