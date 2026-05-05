import { ArrowUpRight } from 'lucide-react'
import CompanyLogo from './CompanyLogo.jsx'
import { UrgencyBadge } from './Badge.jsx'
import { getUrgency } from '../utils/urgency.js'

export default function DeadlineCard({ item }) {
  const urgency = getUrgency(item)
  const isEvent = item.kind === 'event'
  return (
    <a
      href={item.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-hover block !p-4"
    >
      <div className="flex items-center gap-3">
        <CompanyLogo company={item.company || item.organizer} size={36} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
          <p className="text-xs text-gray-500 truncate">
            {item.company || item.organizer}
            {item.location ? ` · ${item.location}` : ''}
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-accent shrink-0" />
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <UrgencyBadge urgency={urgency} />
        <span className="chip">{isEvent ? 'Event' : 'Role'}</span>
      </div>
    </a>
  )
}
