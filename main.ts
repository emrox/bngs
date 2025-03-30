import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  const searchQuery = c.req.query('q')

  if (!searchQuery) {
    return c.redirect(`https://www.ecosia.org/`)
  }

  return c.redirect(`https://www.ecosia.org/search?q=${encodeURI(searchQuery)}`)
})

Deno.serve(app.fetch)
