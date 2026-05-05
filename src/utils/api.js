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
  const data = await res.json()

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
