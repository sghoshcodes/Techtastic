import { useEffect, useRef, useState } from 'react'

const THRESHOLD = 70
const MAX_PULL = 120

export function usePullToRefresh(onRefresh) {
  const containerRef = useRef(null)
  const startY = useRef(null)
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    function onTouchStart(e) {
      if (el.scrollTop > 0) {
        startY.current = null
        return
      }
      startY.current = e.touches[0].clientY
    }
    function onTouchMove(e) {
      if (startY.current == null || refreshing) return
      const dy = e.touches[0].clientY - startY.current
      if (dy > 0) {
        const pulled = Math.min(MAX_PULL, dy * 0.5)
        setPull(pulled)
      }
    }
    async function onTouchEnd() {
      const reached = pull >= THRESHOLD
      startY.current = null
      if (reached) {
        setRefreshing(true)
        try {
          await onRefresh?.()
        } finally {
          setRefreshing(false)
          setPull(0)
        }
      } else {
        setPull(0)
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [onRefresh, pull, refreshing])

  return { containerRef, pull, refreshing }
}
