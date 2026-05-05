import { useState, useMemo } from 'react'

const EMOJI_MAP = {
  google: '🔍', meta: '🌀', facebook: '🌀', apple: '🍎', amazon: '📦',
  microsoft: '🪟', nvidia: '🟢', openai: '✴️', anthropic: '🧠',
  databricks: '🧱', stripe: '💳', figma: '🎨', notion: '📝',
  vercel: '▲', cohere: '💬', deepmind: '🧪', spacex: '🚀', tesla: '⚡',
  uber: '🚕', airbnb: '🏠', netflix: '🎬', salesforce: '☁️', adobe: '🔺',
  cloudflare: '🟧', twilio: '☎️', mongodb: '🍃', snowflake: '❄️',
  palantir: '🛰️', datadog: '🐶', hashicorp: '🔧', confluent: '🌊',
  elastic: '🔎', gitlab: '🦊', atlassian: '🅰️', hubspot: '🟧',
  zendesk: '🟢', okta: '🔐', supabase: '🟩', linear: '➖', rippling: '🌊'
}

function guessDomain(company) {
  const c = (company || '').toLowerCase().trim()
  if (!c) return null
  const direct = c.replace(/[^a-z0-9]/g, '')
  if (!direct) return null
  if (direct === 'google') return 'google.com'
  if (direct === 'meta' || direct === 'facebook') return 'meta.com'
  if (direct === 'amazon') return 'amazon.com'
  if (direct === 'microsoft') return 'microsoft.com'
  if (direct === 'apple') return 'apple.com'
  if (direct === 'openai') return 'openai.com'
  if (direct === 'anthropic') return 'anthropic.com'
  if (direct === 'nvidia') return 'nvidia.com'
  if (direct === 'janestreet') return 'janestreet.com'
  return `${direct}.com`
}

function pickEmoji(company) {
  const c = (company || '').toLowerCase()
  for (const key of Object.keys(EMOJI_MAP)) {
    if (c.includes(key)) return EMOJI_MAP[key]
  }
  return '🏢'
}

export default function CompanyLogo({ company, size = 40 }) {
  const [failed, setFailed] = useState(false)
  const domain = useMemo(() => guessDomain(company), [company])
  const emoji = useMemo(() => pickEmoji(company), [company])

  if (!domain || failed) {
    return (
      <div
        className="rounded-xl bg-gray-100 flex items-center justify-center text-lg shrink-0"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <span style={{ fontSize: size * 0.55 }}>{emoji}</span>
      </div>
    )
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}`}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="rounded-xl bg-white object-contain shrink-0 ring-1 ring-gray-100"
      style={{ width: size, height: size }}
      loading="lazy"
    />
  )
}
