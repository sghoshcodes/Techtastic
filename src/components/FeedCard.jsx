import { ArrowUpRight, MapPin, Calendar } from 'lucide-react'
import CompanyLogo from './CompanyLogo.jsx'
import { FitBadge, UrgencyBadge, Chip } from './Badge.jsx'
import { getUrgency } from '../utils/urgency.js'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function FeedCard({ item, score }) {
  const urgency = getUrgency(item)
  const isEvent = item.kind === 'event'
  const ctaLabel = isEvent ? 'Register' : 'Apply'

  return (
    <a
      href={item.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-hover block"
    >
      <div className="flex items-start gap-3">
        <CompanyLogo company={item.company || item.organizer} />
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 leading-snug line-clamp-2">
            {item.title}
          </p>
          <p className="mt-0.5 text-sm text-gray-500 truncate">
            {item.company || item.organizer}
            {item.location ? (
              <span className="inline-flex items-center gap-1 before:content-['·'] before:mx-1.5 before:text-gray-300">
                <MapPin className="h-3 w-3" />
                {item.location}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {typeof score === 'number' && <FitBadge score={score} />}
        <UrgencyBadge urgency={urgency} />
        {(item.tags || []).slice(0, 4).map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-400 inline-flex items-center gap-1">
          {item.deadline ? (
            <>
              <Calendar className="h-3.5 w-3.5" />
              Closes {formatDate(item.deadline)}
            </>
          ) : item.datePosted ? (
            <>Posted {formatDate(item.datePosted)}</>
          ) : null}
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
          {ctaLabel}
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </a>
  )
}
