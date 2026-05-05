// Mirrors src/utils/fitScore.js tier lists for server-side ordering (variety in feed).

export const TIER_1 = [
  'google', 'meta', 'apple', 'amazon', 'microsoft', 'nvidia', 'openai',
  'anthropic', 'databricks', 'stripe', 'figma', 'notion', 'vercel',
  'scale ai', 'cohere', 'deepmind', 'spacex', 'tesla', 'uber', 'airbnb',
  'netflix', 'salesforce', 'adobe', 'goldman', 'morgan stanley', 'jpmorgan',
  'citadel', 'jane street', 'two sigma', 'de shaw', 'hudson river trading'
]

export const TIER_2 = [
  'cloudflare', 'twilio', 'mongodb', 'snowflake', 'palantir', 'datadog',
  'hashicorp', 'confluent', 'elastic', 'gitlab', 'atlassian', 'hubspot',
  'zendesk', 'okta', 'pagerduty', 'splunk', 'supabase', 'linear', 'rippling',
  'coinbase', 'robinhood', 'doordash', 'instacart', 'snap', 'pinterest',
  'lyft', 'dropbox', 'box', 'oracle', 'sap', 'ibm', 'intel', 'amd', 'qualcomm'
]

/** Higher score = more recognizable tier (for round-robin mixing). */
export function companyTierScore(company) {
  const c = (company || '').toLowerCase()
  if (TIER_1.some((x) => c.includes(x))) return 3
  if (TIER_2.some((x) => c.includes(x))) return 2
  return 1
}

/**
 * Round-robin tier1 → tier2 → other so the feed shows FAANG-tier names in the mix,
 * not only whoever sorted last alphabetically.
 */
export function interleaveByTier(itemsSortedNewestFirst, max = 350) {
  const tier1 = []
  const tier2 = []
  const rest = []
  for (const it of itemsSortedNewestFirst) {
    const s = companyTierScore(it.company)
    if (s === 3) tier1.push(it)
    else if (s === 2) tier2.push(it)
    else rest.push(it)
  }

  const out = []
  let i = 0
  let j = 0
  let k = 0
  while (out.length < max && (i < tier1.length || j < tier2.length || k < rest.length)) {
    if (i < tier1.length) out.push(tier1[i++])
    if (out.length >= max) break
    if (j < tier2.length) out.push(tier2[j++])
    if (out.length >= max) break
    if (k < rest.length) out.push(rest[k++])
  }
  return out
}
