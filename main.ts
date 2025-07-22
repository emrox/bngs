import rawBngs from '@data/bngs.json' with { type: 'json' }
import { Hono } from 'hono'
import { serveStatic } from 'hono/deno'
import { secureHeaders } from 'hono/secure-headers'

const bngs: Record<string, string> = rawBngs // The import is not typed, so we work around it and add typing here

const bangRegex = /!([^\s]+)/

const defaultRedirect = (searchQuery: string) => {
  return `https://www.ecosia.org/search?q=${encodeURI(searchQuery)}`
}

const app = new Hono()
app.use(
  secureHeaders({
    xFrameOptions: 'DENY',
  }),
)

app.get('/search', (c) => {
  const searchQuery = c.req.query('q')

  if (!searchQuery) {
    return c.redirect(`https://www.ecosia.org/`)
  }

  if (!searchQuery.includes('!')) {
    return c.redirect(defaultRedirect(searchQuery))
  }

  const bangMatch = searchQuery.match(bangRegex)
  if (!bangMatch) {
    return c.redirect(defaultRedirect(searchQuery))
  }

  const bang = bangMatch[1]
  const bangUrl = bngs[bang]
  if (!bangUrl) {
    return c.redirect(defaultRedirect(searchQuery))
  }

  const bangSearchQuery = searchQuery.replace(`!${bang}`, '').trim()
  return c.redirect(bangUrl.replace('{{{s}}}', encodeURI(bangSearchQuery)))
})

app.use('*', serveStatic({ root: './static/' }))

Deno.serve(app.fetch)
