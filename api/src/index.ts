import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import entries from './routes/entries'

const app = new OpenAPIHono()

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

const route = app.route('/api/entries', entries)

export type AppType = typeof route

export default app
