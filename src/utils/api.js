const memoryCache = new Map()
const TTL_MS = 10 * 60 * 1000

function lsKey(url) {
  return `techtastic_cache:${url}`
}

function readLS(url) {
  try {
    const raw = localStorage.getItem(lsKey(url))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.t > TTL_MS) return null
    return parsed
  } catch {
    return null
  }
}

function writeLS(url, data) {
  try {
    localStorage.setItem(lsKey(url), JSON.stringify({ t: Date.now(), data }))
  } catch {
    /* quota exceeded -- ignore */
  }
}

export async function fetchJSON(url, { force = false } = {}) {
  if (!force) {
    const mem = memoryCache.get(url)
    if (mem && Date.now() - mem.t < TTL_MS) return mem.data

    const ls = readLS(url)
    if (ls) {
      memoryCache.set(url, ls)
      return ls.data
    }
  }

  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${url} returned ${res.status}`)
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    const preview = text.slice(0, 80).replace(/\s+/g, ' ')
    throw new Error(
      preview.startsWith('import') || preview.startsWith('<!') || preview.startsWith('<html')
        ? `${url} did not return JSON (got HTML or JS). If you use npm run dev locally, /api routes are missing — use npx vercel dev.`
        : `Invalid JSON from ${url}: ${preview}…`
    )
  }

  memoryCache.set(url, { t: Date.now(), data })
  writeLS(url, data)
  return data
}

export function clearAllCaches() {
  memoryCache.clear()
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('techtastic_cache:'))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}

export function lastRefreshedAt(url) {
  const mem = memoryCache.get(url)
  if (mem) return mem.t
  const ls = readLS(url)
  return ls ? ls.t : null
}
