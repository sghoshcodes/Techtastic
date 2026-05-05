import { useEffect } from 'react'
import { useEndpoint } from '../hooks/useFeedData.js'
import BuzzCard from '../components/BuzzCard.jsx'
import { SkeletonList } from '../components/SkeletonCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { afterApiErrorCopy } from '../utils/devApiHint.js'

export default function Buzz({ refreshNonce }) {
  const buzz = useEndpoint('/api/buzz')

  useEffect(() => {
    if (refreshNonce > 0) buzz.refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshNonce])

  if (buzz.loading && !buzz.data) {
    return (
      <div className="px-4 pt-4 pb-32">
        <SkeletonList count={4} />
      </div>
    )
  }

  const items = (buzz.data && buzz.data.items) || []
  if (items.length === 0) {
    if (buzz.error) {
      return (
        <EmptyState
          title="Could not load Reddit"
          copy={`${String(buzz.error.message || buzz.error)}.${afterApiErrorCopy(buzz.error)}`}
        />
      )
    }
    return (
      <EmptyState
        title="No fresh buzz right now"
        copy="Reddit may be rate-limiting us, or no posts matched the filter. Pull down to try again."
      />
    )
  }

  return (
    <div className="px-4 pt-4 pb-32 space-y-3 animate-slideUp">
      {items.map((post) => (
        <BuzzCard key={post.id} post={post} />
      ))}
    </div>
  )
}
