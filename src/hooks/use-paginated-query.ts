'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PaginatedResponse } from '@/lib/api-pagination'

type QueryParams = Record<string, string | number | undefined>

export function usePaginatedQuery<T>(endpoint: string, params: QueryParams) {
  const [data, setData] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const paramsKey = useMemo(() => JSON.stringify(params), [params])

  const fetchData = useCallback(
    async (pageToFetch: number) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      const parsedParams = JSON.parse(paramsKey) as QueryParams
      Object.entries({ ...parsedParams, page: pageToFetch }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value) !== '') {
          searchParams.set(key, String(value))
        }
      })

      try {
        const response = await fetch(`${endpoint}?${searchParams.toString()}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body.error ?? 'Failed to fetch data')
        }
        const result: PaginatedResponse<T> = await response.json()
        if (!controller.signal.aborted) {
          setData(result.data)
          setTotal(result.total)
          setPage(result.page)
          setTotalPages(result.totalPages)
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    },
    [endpoint, paramsKey]
  )

  useEffect(() => {
    setPage(1)
    fetchData(1)
    return () => abortRef.current?.abort()
  }, [paramsKey, fetchData])

  const goToPage = useCallback(
    (nextPage: number) => {
      setPage(nextPage)
      fetchData(nextPage)
    },
    [fetchData]
  )

  const refetch = useCallback(() => fetchData(page), [fetchData, page])

  return {
    data,
    total,
    page,
    totalPages,
    loading,
    error,
    setPage: goToPage,
    refetch,
  }
}
