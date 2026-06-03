import { OpenAPIHono } from '@hono/zod-openapi'
import entries from './routes/entries'

const app = new OpenAPIHono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const route = app.route('/api/entries', entries)

export type AppType = typeof route

export default app
