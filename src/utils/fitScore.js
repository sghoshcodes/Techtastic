const TIER_1 = [
  'google', 'meta', 'apple', 'amazon', 'microsoft', 'nvidia', 'openai',
  'anthropic', 'databricks', 'stripe', 'figma', 'notion', 'vercel',
  'scale ai', 'cohere', 'deepmind', 'spacex', 'tesla', 'uber', 'airbnb',
  'netflix', 'salesforce', 'adobe', 'goldman', 'morgan stanley', 'jpmorgan',
  'citadel', 'jane street', 'two sigma', 'de shaw', 'hudson river trading'
]

const TIER_2 = [
  'cloudflare', 'twilio', 'mongodb', 'snowflake', 'palantir', 'datadog',
  'hashicorp', 'confluent', 'elastic', 'gitlab', 'atlassian', 'hubspot',
  'zendesk', 'okta', 'pagerduty', 'splunk', 'supabase', 'linear', 'rippling',
  'coinbase', 'robinhood', 'doordash', 'instacart', 'snap', 'pinterest',
  'lyft', 'dropbox', 'box', 'oracle', 'sap', 'ibm', 'intel', 'amd', 'qualcomm', 'capital one'
]

export function computeFitScore(item, profile) {
  if (!profile) return 50

  const itemText = `${item.title || ''} ${item.company || ''} ${(item.tags || []).join(' ')}`.toLowerCase()
  const profileSkills = [
    ...(profile.skills || []),
    ...(profile.keywords || []),
    ...(profile.projects || [])
  ]
    .map((s) => String(s).toLowerCase().trim())
    .filter((s) => s.length >= 2)

  const matchedSkills = profileSkills.filter((skill) => itemText.includes(skill))
  const skillsMatch = Math.min(
    100,
    (matchedSkills.length / Math.max(profileSkills.length, 1)) * 100 * 3
  )

  const companyLower = (item.company || '').toLowerCase()
  const tierMatch =
    TIER_1.some((c) => companyLower.includes(c))
      ? 100
      : TIER_2.some((c) => companyLower.includes(c))
        ? 70
        : 40

  return Math.round(skillsMatch * 0.7 + tierMatch * 0.3)
}

export function fitColor(score) {
  if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: '#00C896' }
  if (score >= 60) return { bg: 'bg-amber-50', text: 'text-amber-700', dot: '#F59E0B' }
  return { bg: 'bg-gray-100', text: 'text-gray-600', dot: '#9CA3AF' }
}
