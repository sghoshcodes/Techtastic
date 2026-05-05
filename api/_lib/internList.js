/**
 * Best-effort extraction from intern-list.com (often Next.js __NEXT_DATA__).
 */

export function parseInternListHtml(html) {
  const rows = []
  const seenUrl = new Set()

  const push = (company, title, url, location = '') => {
    if (!company || !title || !url || !url.startsWith('http')) return
    if (seenUrl.has(url)) return
    seenUrl.add(url)
    rows.push({
      company: String(company).trim(),
      title: String(title).trim(),
      location: String(location || '').trim(),
      url,
      datePosted: '',
      deadline: ''
    })
  }

  const nextMatch = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  )
  if (nextMatch) {
    try {
      const data = JSON.parse(nextMatch[1])
      visitNextData(data, 0, push)
    } catch {
      /* ignore */
    }
  }

  return rows.slice(0, 120)
}

function visitNextData(o, depth, push) {
  if (depth > 18 || !o) return
  if (typeof o === 'object') {
    if (!Array.isArray(o)) {
      const title =
        o.title || o.roleTitle || o.jobTitle || o.name || o.role || o.position
      const company =
        o.company || o.companyName || o.employer || o.organization || o.org
      const url =
        o.url ||
        o.applyUrl ||
        o.applicationUrl ||
        o.jobUrl ||
        (typeof o.link === 'string' ? o.link : '')
      const location =
        o.location ||
        o.city ||
        (typeof o.locations === 'string' ? o.locations : '') ||
        ''
      if (
        title &&
        company &&
        typeof url === 'string' &&
        url.startsWith('http')
      ) {
        push(company, title, url, location)
      }
    }
    for (const v of Object.values(o)) visitNextData(v, depth + 1, push)
  }
}
