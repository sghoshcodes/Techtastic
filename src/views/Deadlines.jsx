import { useEffect, useMemo } from 'react'
import { useEndpoint } from '../hooks/useFeedData.js'
import DeadlineCard from '../components/DeadlineCard.jsx'
import { SkeletonList } from '../components/SkeletonCard.jsx'
import EmptyState from '../components/EmptyState.jsx'

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function dayLabel(date, todayStart) {
  const diff = Math.round((date - todayStart) / DAY_MS)
  const weekday = date.toLocaleDateString(undefined, { weekday: 'short' })
  const monthDay = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  let prefix
  if (diff === 0) prefix = 'Today'
  else if (diff === 1) prefix = 'Tomorrow'
  else prefix = weekday
  return `${prefix} — ${weekday} ${monthDay}`
}

export default function Deadlines({ refreshNonce }) {
  const roles = useEndpoint('/api/roles')
  const events = useEndpoint('/api/events')

  useEffect(() => {
    if (refreshNonce > 0) {
      roles.refresh()
      events.refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshNonce])

  const loading = roles.loading || events.loading

  const days = useMemo(() => {
    const all = [
      ...((roles.data && roles.data.items) || []),
      ...((events.data && events.data.items) || [])
    ].filter((it) => it.deadline)

    const todayStart = startOfDay(new Date())
    const buckets = []
    for (let i = 0; i < 7; i++) {
      const start = new Date(todayStart.getTime() + i * DAY_MS)
      const end = new Date(start.getTime() + DAY_MS)
      const items = all
        .filter((it) => {
          const d = new Date(it.deadline)
          return !isNaN(d.getTime()) && d >= start && d < end
        })
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      buckets.push({ date: start, label: dayLabel(start, todayStart), items })
    }
    return buckets
  }, [roles.data, events.data])

  if (loading && days.every((d) => d.items.length === 0)) {
    return (
      <div className="px-4 pt-4 pb-32">
        <SkeletonList count={3} />
      </div>
    )
  }

  const totalItems = days.reduce((acc, d) => acc + d.items.length, 0)
  if (!loading && totalItems === 0) {
    return (
      <EmptyState
        title="Nothing closing in the next 7 days"
        copy="You're all caught up. New deadlines will appear here as they're posted."
      />
    )
  }

  return (
    <div className="px-4 pt-4 pb-32 space-y-6 animate-slideUp">
      {days.map((day) => (
        <section key={day.date.toISOString()}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 px-1">
            {day.label}
          </h3>
          {day.items.length === 0 ? (
            <p className="text-xs text-gray-400 px-1 py-2">Nothing closing</p>
          ) : (
            <div className="space-y-2">
              {day.items.map((it) => (
                <DeadlineCard key={`${it.kind}-${it.id || it.url || it.title}`} item={it} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
