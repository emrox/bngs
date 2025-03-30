import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'

import importBangFile from "./bang.json" with { type: "json" };
const bangs: Record<string, string> = {};
for (const importBang of importBangFile) {
  bangs[importBang.t] = importBang.u
}

const bangRegex = new RegExp(`!([^\\s]+)`)

const defaultRedirect = (searchQuery: string) => {
  return `https://www.ecosia.org/search?q=${encodeURI(searchQuery)}`
}

const app = new Hono()
app.use(secureHeaders(
  {
    xFrameOptions: "DENY",
  }
))

app.get('/', (c) => {
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
  const bangUrl = bangs[bang]
  if (!bangUrl) {
    return c.redirect(defaultRedirect(searchQuery))
  }

  const bangSearchQuery = searchQuery.replace(`!${bang}`, '').trim()
  return c.redirect(bangUrl.replace('{{{s}}}', encodeURI(bangSearchQuery)))
})

Deno.serve(app.fetch)
