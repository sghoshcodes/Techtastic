import { parseMarkdownTables, normalizeDatePosted } from './_lib/markdown.js'
import { parseInternListHtml } from './_lib/internList.js'
import { interleaveByTier } from './_lib/tiers.js'

/** Extra markdown tables from community trackers + international listings. */
const SOURCES = [
  {
    name: 'speedyapply-2026-newgrad-usa',
    url: 'https://raw.githubusercontent.com/speedyapply/2026-SWE-College-Jobs/main/NEW_GRAD_USA.md'
  },
  {
    name: 'speedyapply-2026-newgrad-intl',
    url: 'https://raw.githubusercontent.com/speedyapply/2026-SWE-College-Jobs/main/NEW_GRAD_INTL.md'
  },
  {
    name: 'speedyapply-2026-readme-index',
    url: 'https://raw.githubusercontent.com/speedyapply/2026-SWE-College-Jobs/main/README.md'
  },
  {
    name: 'vanshb03-newgrad-2027-dev',
    url: 'https://raw.githubusercontent.com/vanshb03/New-Grad-2027/dev/README.md'
  },
  {
    name: 'vanshb03-canada',
    url: 'https://raw.githubusercontent.com/vanshb03/New-Grad-2027/dev/Canada.md'
  }
]

/** Drop listings whose "posted" cell parsed to older than this (keeps feed fresher). */
const MAX_LISTING_AGE_MS = 105 * 24 * 60 * 60 * 1000

const TECH_TOKENS = [
  'software', 'swe', 'sde', 'engineer', 'developer',
  'machine learning', ' ml ', 'mlops', ' ai ', 'data scien', 'data engineer', 'data analyst',
  'product manager', ' pm ', ' apm', 'tpm', 'technical program',
  'devrel', 'developer relations', 'devops', 'site reliability', ' sre ',
  'security', 'infosec', 'cyber',
  'qa engineer', 'test engineer', 'quality engineer',
  'platform', 'infrastructure', 'cloud', 'backend', 'frontend', 'full stack',
  'firmware', 'embedded', 'systems engineer', 'compiler', 'graphics', 'robotics',
  'research engineer', 'applied scientist', 'computer vision', 'nlp'
]

const NON_TECH_BLOCK = [
  'mechanical engineer', 'civil engineer', 'electrical engineer', 'chemical engineer',
  'industrial engineer', 'manufacturing engineer', 'process engineer', 'sales engineer',
  'field engineer', 'project engineer', 'aerospace engineer', 'biomedical engineer',
  'environmental engineer', 'structural engineer', 'mining engineer', 'petroleum'
]

function isTechRole(title) {
  const t = ` ${title.toLowerCase()} `
  if (NON_TECH_BLOCK.some((bad) => t.includes(bad))) return false
  return TECH_TOKENS.some((tok) => t.includes(tok))
}

function deriveTags(row) {
  const tags = []
  const loc = (row.location || '').toLowerCase()
  const title = (row.title || '').toLowerCase()
  if (loc.includes('remote')) tags.push('Remote')
  if (loc.includes('hybrid')) tags.push('Hybrid')
  if (title.includes('intern')) tags.push('Intern')
  else tags.push('New Grad')
  if (/\b202[5-9]\b/.test(title)) {
    const m = title.match(/\b(202[5-9])\b/)
    if (m) tags.push(m[1])
  }
  if (title.includes('ml') || title.includes('machine learning') || title.includes('ai')) tags.push('ML')
  if (title.includes('backend')) tags.push('Backend')
  if (title.includes('frontend')) tags.push('Frontend')
  if (title.includes('full stack') || title.includes('fullstack')) tags.push('Full Stack')
  if (title.includes('security') || title.includes('infosec')) tags.push('Security')
  if (title.includes('data')) tags.push('Data')
  return Array.from(new Set(tags))
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'techtastic/1.0 (+https://techtastic.vercel.app)',
      Accept: 'text/plain, text/markdown, */*'
    }
  })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return res.text()
}

async function fetchInternList() {
  try {
    const res = await fetch('https://www.intern-list.com/', {
      headers: {
        'User-Agent': 'techtastic/1.0 (+https://techtastic.vercel.app)',
        Accept: 'text/html'
      }
    })
    if (!res.ok) return []
    const html = await res.text()
    return parseInternListHtml(html)
  } catch {
    return []
  }
}

function filterStaleRows(rows, nowMs) {
  return rows.filter((item) => {
    if (item.deadline) {
      const end = new Date(item.deadline).getTime()
      if (!isNaN(end) && end < nowMs - 48 * 60 * 60 * 1000) return false
    }
    if (item.datePosted) {
      const posted = new Date(item.datePosted).getTime()
      if (!isNaN(posted) && nowMs - posted > MAX_LISTING_AGE_MS) return false
    }
    return true
  })
}

function sortNewestFirst(rows) {
  return [...rows].sort((a, b) => {
    const ta = a.datePosted ? new Date(a.datePosted).getTime() : 0
    const tb = b.datePosted ? new Date(b.datePosted).getTime() : 0
    return tb - ta
  })
}

export default async function handler(req, res) {
  try {
    const settled = await Promise.allSettled([
      ...SOURCES.map(async (s) => parseMarkdownTables(await fetchText(s.url))),
      fetchInternList()
    ])

    const all = []
    for (const r of settled) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) all.push(...r.value)
    }

    const seen = new Set()
    const out = []
    const nowMs = Date.now()

    for (const row of all) {
      if (!row.company || !row.title) continue
      if (!isTechRole(row.title)) continue
      const key = `${row.company.toLowerCase().trim()}|${row.title.toLowerCase().trim()}`
      if (seen.has(key)) continue
      seen.add(key)

      out.push({
        id: key,
        kind: 'role',
        company: row.company,
        title: row.title,
        location: row.location || 'See posting',
        url: row.url || '',
        datePosted: normalizeDatePosted(row.datePosted),
        deadline: normalizeDatePosted(row.deadline),
        tags: deriveTags(row)
      })
    }

    const fresh = filterStaleRows(out, nowMs)
    const sorted = sortNewestFirst(fresh)
    const mixed = interleaveByTier(sorted, 350)

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600')
    res.status(200).send(JSON.stringify({ count: mixed.length, items: mixed }))
  } catch (err) {
    res.status(500).json({ error: 'roles_fetch_failed', message: String(err && err.message ? err.message : err) })
  }
}
