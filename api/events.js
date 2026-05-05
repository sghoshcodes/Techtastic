import { getSeedEvents } from './_lib/seedEvents.js'

const TECH_KEYWORDS = [
  'tech', 'engineering', 'software', 'swe', 'developer', 'recruit',
  'new grad', 'intern', 'career', 'machine learning', ' ml ', ' ai ',
  'data scien', 'data engineer', 'product manager', 'devrel', 'security',
  'startup', 'hackathon', 'info session', 'coffee chat', 'open house'
]

function looksTech(item) {
  const blob = `${item.title || ''} ${item.organizer || ''} ${(item.tags || []).join(' ')}`.toLowerCase()
  return TECH_KEYWORDS.some((k) => blob.includes(k))
}

function extractJsonLd(html) {
  const scripts = []
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html))) scripts.push(m[1])
  const events = []
  for (const raw of scripts) {
    try {
      const parsed = JSON.parse(raw.trim())
      const list = Array.isArray(parsed) ? parsed : [parsed]
      for (const node of list) {
        const items = node['@graph'] || [node]
        for (const it of items) {
          const t = it && it['@type']
          const types = Array.isArray(t) ? t : [t]
          if (types.some((x) => typeof x === 'string' && x.toLowerCase().includes('event'))) {
            events.push(it)
          }
        }
      }
    } catch {
      /* ignore malformed JSON-LD blocks */
    }
  }
  return events
}

function shapeEvent(ev, source) {
  const loc = ev.location
  let location = ''
  if (typeof loc === 'string') location = loc
  else if (loc && loc.name) location = loc.name
  else if (loc && loc.address && loc.address.addressLocality) location = loc.address.addressLocality
  const isVirtual =
    (typeof ev.eventAttendanceMode === 'string' && ev.eventAttendanceMode.toLowerCase().includes('online')) ||
    /online|virtual/i.test(location)

  return {
    id: `${source}-${ev.url || ev.name}`,
    kind: 'event',
    title: ev.name || 'Untitled event',
    organizer: (ev.organizer && (ev.organizer.name || ev.organizer)) || source,
    company: (ev.organizer && (ev.organizer.name || ev.organizer)) || '',
    date: ev.startDate || null,
    deadline: ev.startDate || null,
    format: isVirtual ? 'Virtual' : 'In-person',
    location: location || (isVirtual ? 'Online' : 'TBA'),
    url: ev.url || '',
    tags: [isVirtual ? 'Virtual' : 'In-person']
  }
}

async function tryFetchJsonLd(url, source) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'techtastic/1.0 (+https://techtastic.vercel.app)',
        Accept: 'text/html'
      }
    })
    if (!res.ok) return []
    const html = await res.text()
    return extractJsonLd(html).map((ev) => shapeEvent(ev, source))
  } catch {
    return []
  }
}

export default async function handler(req, res) {
  try {
    const settled = await Promise.allSettled([
      tryFetchJsonLd('https://lu.ma/discover', 'luma'),
      tryFetchJsonLd('https://www.eventbrite.com/d/online/tech-events/', 'eventbrite')
    ])

    const fetched = []
    for (const r of settled) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) fetched.push(...r.value)
    }

    const seed = getSeedEvents()
    const all = [...seed, ...fetched]

    const seen = new Set()
    const out = []
    for (const ev of all) {
      if (!ev.title) continue
      if (!looksTech(ev) && !ev.id.startsWith('seed-')) continue
      const key = `${(ev.organizer || ev.company || '').toLowerCase()}|${ev.title.toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push(ev)
    }

    out.sort((a, b) => {
      const ta = a.date ? new Date(a.date).getTime() : Infinity
      const tb = b.date ? new Date(b.date).getTime() : Infinity
      return ta - tb
    })

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600')
    res.status(200).send(JSON.stringify({ count: out.length, items: out }))
  } catch (err) {
    res.status(500).json({ error: 'events_fetch_failed', message: String(err && err.message ? err.message : err) })
  }
}
