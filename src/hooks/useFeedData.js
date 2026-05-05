import { useEffect, useState, useCallback } from 'react'
import { fetchJSON } from '../utils/api.js'

export function useEndpoint(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshedAt, setRefreshedAt] = useState(null)

  const load = useCallback(
    async ({ force = false } = {}) => {
      setLoading(true)
      setError(null)
      try {
        const json = await fetchJSON(url, { force })
        setData(json)
        setRefreshedAt(Date.now())
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    },
    [url]
  )

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, refreshedAt, refresh: () => load({ force: true }) }
}
