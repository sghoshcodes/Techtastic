// Lightweight markdown-table parser tailored to the new-grad job repos.
// No external deps -- runs on Vercel Node serverless functions.

const HEADER_ALIASES = {
  company: ['company', 'employer'],
  title: ['role', 'title', 'job title', 'position'],
  location: ['location', 'locations', 'city'],
  url: ['application/link', 'application', 'apply', 'link', 'application link'],
  datePosted: ['date posted', 'posted', 'date'],
  deadline: ['deadline', 'expires', 'closes']
}

function stripMarkdown(cell) {
  if (!cell) return ''
  let s = String(cell)
  // Drop image markdown: ![alt](url)
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
  // Drop HTML img tags
  s = s.replace(/<img[^>]*>/gi, '')
  // Convert link markdown [text](url) -> text
  s = s.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_, text) => text.trim())
  // Drop bold/italic markers
  s = s.replace(/[*_`]+/g, '')
  // Strip surrounding HTML tags
  s = s.replace(/<\/?[a-z][^>]*>/gi, ' ')
  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

function extractFirstUrl(cell) {
  if (!cell) return ''
  const md = String(cell).match(/\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/)
  if (md) return md[1]
  const html = String(cell).match(/href=["'](https?:\/\/[^"']+)["']/i)
  if (html) return html[1]
  const bare = String(cell).match(/https?:\/\/\S+/)
  if (bare) return bare[0].replace(/[)>,.;]+$/, '')
  return ''
}

function classifyHeaders(headerCells) {
  const lower = headerCells.map((h) => stripMarkdown(h).toLowerCase())
  const map = {}
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    const idx = lower.findIndex((h) => aliases.some((a) => h === a || h.includes(a)))
    if (idx !== -1) map[field] = idx
  }
  return map
}

function splitRow(line) {
  // Trim leading/trailing pipes, then split. Don't trim cells yet -- preserve internal spaces.
  let trimmed = line.trim()
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1)
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1)
  return trimmed.split('|').map((c) => c.trim())
}

function isSeparatorRow(line) {
  return /^\s*\|?\s*:?[-]{2,}/.test(line) && line.includes('|')
}

const ARROW = /^[\s↳⤷›>\-]+/

function inheritCompany(rows) {
  // Some repos use ↳ in the company column to indicate "same as previous".
  let last = ''
  for (const row of rows) {
    const c = row.company || ''
    if (!c || ARROW.test(c) || c === '↳' || c === '"') {
      row.company = last
    } else {
      last = c
    }
  }
  return rows
}

export function parseMarkdownTables(markdown) {
  const lines = markdown.split(/\r?\n/)
  const allRows = []

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    // A potential header row: contains a pipe and the next line is a separator.
    if (line.includes('|') && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      const header = splitRow(line)
      const colMap = classifyHeaders(header)
      // We need at minimum company + title to consider this a job table.
      if (colMap.company !== undefined && colMap.title !== undefined) {
        i += 2
        while (i < lines.length && lines[i].includes('|') && !isSeparatorRow(lines[i])) {
          const cells = splitRow(lines[i])
          // Skip empty / malformed rows
          if (cells.length >= 2 && cells.some((c) => c.length > 0)) {
            const row = {
              company: stripMarkdown(cells[colMap.company]),
              title: stripMarkdown(cells[colMap.title]),
              location: colMap.location !== undefined ? stripMarkdown(cells[colMap.location]) : '',
              url: colMap.url !== undefined ? extractFirstUrl(cells[colMap.url]) : '',
              datePosted: colMap.datePosted !== undefined ? stripMarkdown(cells[colMap.datePosted]) : '',
              deadline: colMap.deadline !== undefined ? stripMarkdown(cells[colMap.deadline]) : ''
            }
            // If url not found in the apply column, scan title/company cells.
            if (!row.url) {
              row.url = extractFirstUrl(cells[colMap.title]) || extractFirstUrl(cells[colMap.company])
            }
            if (row.company && row.title) allRows.push(row)
          }
          i++
        }
        continue
      }
    }
    i++
  }

  return inheritCompany(allRows)
}

export function normalizeDatePosted(raw) {
  if (!raw) return null
  const s = raw.trim()
  // Repos commonly write "Nov 15", "Nov 15, 2025", "2d", "1mo", etc.
  // Try ISO / Date-parseable first.
  const direct = new Date(s)
  if (!isNaN(direct.getTime()) && s.length >= 5) return direct.toISOString()

  const now = new Date()
  // "Xh", "Xd", "Xmo" relative
  const rel = s.match(/^(\d+)\s*(h|hr|hrs|hour|hours|d|day|days|mo|mon|months?)$/i)
  if (rel) {
    const n = parseInt(rel[1], 10)
    const unit = rel[2].toLowerCase()
    const ms = unit.startsWith('h')
      ? n * 60 * 60 * 1000
      : unit.startsWith('mo')
        ? n * 30 * 24 * 60 * 60 * 1000
        : n * 24 * 60 * 60 * 1000
    return new Date(now.getTime() - ms).toISOString()
  }

  // "Nov 15" without year -> assume current year, fall back to last year if future
  const monthDay = s.match(/^([A-Za-z]{3,9})\s+(\d{1,2})$/)
  if (monthDay) {
    const year = now.getFullYear()
    const guess = new Date(`${monthDay[1]} ${monthDay[2]}, ${year}`)
    if (!isNaN(guess.getTime())) {
      if (guess > now) guess.setFullYear(year - 1)
      return guess.toISOString()
    }
  }
  return null
}
