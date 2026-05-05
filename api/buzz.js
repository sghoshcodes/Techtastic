const SUBS = [
  { sub: 'csMajors', limit: 28 },
  { sub: 'cscareerquestions', limit: 28 },
  { sub: 'internships', limit: 22 }
]

/** Primary filter — career / recruiting adjacent */
const STRICT_RE = /intern|new ?grad|offer|interview|recruit|hiring|reject|\boa\b|onsite|swe|application|ghost|return offer|sign(ed)? offer|negotiat|amazon|meta|google|microsoft|apple|nvidia|openai|salary|leetcode|resume|linkedin|startup|full[- ]?time|internship|co-?op|layoff|team match|hm round|recruiter|faang|big\s*n|junior|entry level|new grad/gi

/** Looser fallback when hot threads don't match (still career-ish subs) */
const BROAD_RE = /career|job|engineer|developer|cs\s|coding|programming|tech|software|data science|machine learning|hire|campus|university|graduate|intern|company|thread|advice|question|discussion|amazon|meta|google|leetcode/gi

const UA = {
  'User-Agent': 'techtastic/1.0 (+https://techtastic.vercel.app)',
  Accept: 'application/json'
}

async function fetchListing(kind, sub, limit) {
  const url = `https://www.reddit.com/r/${sub}/${kind}.json?limit=${limit}`
  const res = await fetch(url, { headers: UA })
  if (!res.ok) throw new Error(`r/${sub}/${kind} -> ${res.status}`)
  const json = await res.json()
  const children = (json && json.data && json.data.children) || []
  return children.map(({ data }) => ({
    id: data.id,
    kind: 'buzz',
    title: data.title,
    subreddit: data.subreddit,
    score: data.score,
    numComments: data.num_comments,
    url: `https://www.reddit.com${data.permalink}`,
    datePosted: new Date((data.created_utc || 0) * 1000).toISOString(),
    stickied: !!data.stickied,
    over18: !!data.over_18,
    createdUtc: data.created_utc || 0
  }))
}

async function fetchSubredditMerged(sub, limit) {
  const [hot, newest] = await Promise.all([
    fetchListing('hot', sub, limit),
    fetchListing('new', sub, Math.min(limit, 28))
  ])
  const map = new Map()
  for (const p of [...hot, ...newest]) map.set(p.id, p)
  return [...map.values()]
}

export default async function handler(req, res) {
  try {
    const settled = await Promise.allSettled(SUBS.map(({ sub, limit }) => fetchSubredditMerged(sub, limit)))
    const pool = []
    for (const r of settled) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) pool.push(...r.value)
    }

    const clean = pool.filter((p) => !p.stickied && !p.over18)

    let picked = clean.filter((p) => STRICT_RE.test(p.title))
    if (picked.length < 14) {
      const ids = new Set(picked.map((p) => p.id))
      const more = clean.filter((p) => !ids.has(p.id) && BROAD_RE.test(p.title))
      picked = [...picked, ...more]
    }

    const seen = new Set()
    const deduped = []
    for (const p of picked) {
      if (seen.has(p.id)) continue
      seen.add(p.id)
      deduped.push(p)
    }

    // Prefer **recent** threads so Buzz feels alive (then engagement).
    deduped.sort((a, b) => {
      const tc = (b.createdUtc || 0) - (a.createdUtc || 0)
      if (tc !== 0) return tc
      return (b.score || 0) - (a.score || 0)
    })

    const items = deduped.slice(0, 35).map(({ createdUtc, ...rest }) => rest)

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800')
    res.status(200).send(JSON.stringify({ count: items.length, items }))
  } catch (err) {
    res.status(500).json({ error: 'buzz_fetch_failed', message: String(err && err.message ? err.message : err) })
  }
}
