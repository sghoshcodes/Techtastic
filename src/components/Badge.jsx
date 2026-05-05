import { fitColor } from '../utils/fitScore.js'
import { urgencyClasses } from '../utils/urgency.js'

export function FitBadge({ score }) {
  const c = fitColor(score)
  return (
    <span className={`pill ${c.bg} ${c.text}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
      {score}% fit
    </span>
  )
}

export function UrgencyBadge({ urgency }) {
  if (!urgency) return null
  return (
    <span className={`pill ${urgencyClasses(urgency.color)}`}>
      {urgency.color === 'green' ? '✨ ' : ''}
      {urgency.label}
    </span>
  )
}

export function Chip({ children }) {
  return <span className="chip">{children}</span>
}
