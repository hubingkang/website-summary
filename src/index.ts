import { Hono } from 'hono'
import { env } from 'hono/adapter'

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/summary/*', async (c) => {
  const { JINA_KEY } = env<{ JINA_KEY: string }>(c)

  const url = c.req.path.substring('/summary/'.length)
  const res = await fetch(`https://r.jina.ai/${url}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${JINA_KEY}`,
    },
  })

  const str = await res.text()

  const results = await c.env.AI.run('@cf/meta/llama-3-8b-instruct', {
    messages: [
      {
        role: 'user',
        content: `Summarize the content below：\n ${str}`,
      },
    ],
  })

  return c.json(results)
})

export default app
