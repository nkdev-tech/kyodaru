import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { httpServerIntegration, sentry } from '@sentry/hono/cloudflare'
import { type AuthType, auth } from './lib/auth'
import ai from './routes/ai'
import entries from './routes/entries'
import versionCheck from './routes/version-check'

const app = new OpenAPIHono<{
  Bindings: CloudflareBindings
  Variables: AuthType
}>({
  strict: false,
})

app.use(
  sentry(app, (env) => ({
    dsn: env.SENTRY_DSN,
    environment: env.ENVIRONMENT ?? 'development',
    dataCollection: {
      httpBodies: [],
    },
    integrations: [httpServerIntegration({ maxRequestBodySize: 'none' })],
  })),
)

app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    c.set('user', null)
    c.set('session', null)
    await next()
    return
  }
  c.set('user', session.user)
  c.set('session', session.session)
  await next()
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: '今日もだるい API',
  },
})

app.get('/ui', swaggerUI({ url: '/doc' }))

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

app
  .route('/api/entries', entries)
  .route('/api/ai', ai)
  .route('/api/version-check', versionCheck)

export default app
