const SUBS = [
  { sub: 'csMajors', limit: 15 },
  { sub: 'cscareerquestions', limit: 10 }
]

const RECRUITING_REGEX = /intern|new ?grad|offer|interview|recruit|hiring|reject|\boa\b|onsite|swe|application|ghost|return offer|sign(ed)? offer|negotiat/i

async function fetchSubreddit({ sub, limit }) {
  const url = `https://www.reddit.com/r/${sub}/hot.json?limit=${limit}`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'techtastic/1.0 (+https://techtastic.vercel.app)',
      Accept: 'application/json'
    }
  })
  if (!res.ok) throw new Error(`r/${sub} -> ${res.status}`)
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
    over18: !!data.over_18
  }))
}

export default async function handler(req, res) {
  try {
    const settled = await Promise.allSettled(SUBS.map(fetchSubreddit))
    const all = []
    for (const r of settled) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) all.push(...r.value)
    }

    const seen = new Set()
    const out = []
    for (const post of all) {
      if (post.stickied || post.over18) continue
      if (!RECRUITING_REGEX.test(post.title)) continue
      if (seen.has(post.id)) continue
      seen.add(post.id)
      out.push(post)
    }

    out.sort((a, b) => (b.score || 0) - (a.score || 0))

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800')
    res.status(200).send(JSON.stringify({ count: out.length, items: out.slice(0, 25) }))
  } catch (err) {
    res.status(500).json({ error: 'buzz_fetch_failed', message: String(err && err.message ? err.message : err) })
  }
}
