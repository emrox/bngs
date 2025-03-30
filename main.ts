import { Hono } from 'hono'

import importBangFile from "./bang.json" with { type: "json" };
const bangs: Record<string, string> = {};
for (const importBang of importBangFile) {
  bangs[importBang.t] = importBang.u
}

const bangRegex = new RegExp(`!([^\\s]+)`)

const app = new Hono()

app.get('/', (c) => {
  const searchQuery = c.req.query('q')

  if (!searchQuery) {
    return c.redirect(`https://www.ecosia.org/`)
  }

  if (!searchQuery.includes('!')) {
    return c.redirect(`https://www.ecosia.org/search?q=${encodeURI(searchQuery)}`)
  }

  const bangMatch = searchQuery.match(bangRegex)
  if (!bangMatch) {
    return c.redirect(`https://www.ecosia.org/search?q=${encodeURI(searchQuery)}`)
  }

  const bang = bangMatch[1]
  const bangUrl = bangs[bang]
  if (!bangUrl) {
    return c.redirect(`https://www.ecosia.org/search?q=${encodeURI(searchQuery)}`)
  }

  const bangSearchQuery = searchQuery.replace(`!${bang}`, '').trim()
  return c.redirect(bangUrl.replace('{{{s}}}', encodeURI(bangSearchQuery)))
})

Deno.serve(app.fetch)
