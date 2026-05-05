import { useEffect, useMemo } from 'react'
import { useEndpoint } from '../hooks/useFeedData.js'
import { computeFitScore } from '../utils/fitScore.js'
import { urgencyRank } from '../utils/urgency.js'
import FeedCard from '../components/FeedCard.jsx'
import { SkeletonList } from '../components/SkeletonCard.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function ForYou({ profile, refreshNonce }) {
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
  const items = useMemo(() => {
    const all = [
      ...((roles.data && roles.data.items) || []),
      ...((events.data && events.data.items) || [])
    ]
    return all
      .map((it) => ({ it, score: computeFitScore(it, profile), rank: urgencyRank(it) }))
      .sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank
        return b.score - a.score
      })
  }, [roles.data, events.data, profile])

  if (loading && items.length === 0) {
    return (
      <div className="px-4 pt-4 pb-32">
        <SkeletonList count={4} />
      </div>
    )
  }

  if (!loading && items.length === 0) {
    const apiError = roles.error || events.error
    const hint =
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost' &&
      apiError
        ? ' Plain npm run dev does not serve /api routes — run npx vercel dev in the project folder, or open your deployed Vercel URL.'
        : ''
    return (
      <EmptyState
        title="Nothing in your feed yet"
        copy={
          apiError
            ? `${String(apiError.message || apiError)}.${hint || ' Pull down to refresh.'}`
            : 'Sources may be temporarily unreachable. Pull down to refresh.'
        }
      />
    )
  }

  return (
    <div className="px-4 pt-4 pb-32 space-y-3 animate-slideUp">
      {items.map(({ it, score }) => (
        <FeedCard key={`${it.kind}-${it.id || it.url || it.title}`} item={it} score={score} />
      ))}
    </div>
  )
}
