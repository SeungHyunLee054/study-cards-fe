import { useCallback, useEffect, useRef, useState } from 'react'
import type { PageResponse } from '@/types/card'

interface InfiniteScrollOptions<T> {
  fetchPage: (params: { page: number; size: number }) => Promise<PageResponse<T>>
  pageSize?: number
  initialPage?: number
}

interface InfiniteScrollResult<T> {
  items: T[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  totalElements: number
  loadMore: () => void
  refresh: () => Promise<void>
  observerRef: (node: HTMLElement | null) => void
}

export function useInfiniteScrollQuery<T>({
  fetchPage,
  pageSize = 20,
  initialPage = 0,
}: InfiniteScrollOptions<T>): InfiniteScrollResult<T> {
  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalElements, setTotalElements] = useState(0)

  const isLoadingRef = useRef(false)
  const pageRef = useRef(initialPage)
  const observerTargetRef = useRef<HTMLElement | null>(null)
  const observerInstanceRef = useRef<IntersectionObserver | null>(null)
  const hasMoreRef = useRef(hasMore)
  const loadMoreRef = useRef<() => void>(() => {})

  const loadInitial = useCallback(async () => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchPage({ page: initialPage, size: pageSize })
      setItems(response.content)
      setHasMore(!response.last)
      setTotalElements(response.totalElements)
      pageRef.current = initialPage
    } catch (err) {
      setError(err instanceof Error ? err.message : '목록을 불러오는데 실패했습니다')
      setItems([])
      setHasMore(false)
      setTotalElements(0)
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [fetchPage, initialPage, pageSize])

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return
    isLoadingRef.current = true
    setIsLoadingMore(true)

    try {
      const nextPage = pageRef.current + 1
      const response = await fetchPage({ page: nextPage, size: pageSize })
      setItems((prev) => [...prev, ...response.content])
      setHasMore(!response.last)
      pageRef.current = nextPage
    } catch (err) {
      setError(err instanceof Error ? err.message : '더 불러오는데 실패했습니다')
    } finally {
      setIsLoadingMore(false)
      isLoadingRef.current = false
    }
  }, [fetchPage, pageSize])

  const refresh = useCallback(async () => {
    pageRef.current = initialPage
    setHasMore(true)
    await loadInitial()
  }, [initialPage, loadInitial])

  useEffect(() => {
    hasMoreRef.current = hasMore
  }, [hasMore])

  useEffect(() => {
    loadMoreRef.current = loadMore
  }, [loadMore])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  const setObserverRef = useCallback((node: HTMLElement | null) => {
    if (observerInstanceRef.current) {
      observerInstanceRef.current.disconnect()
    }

    if (!node) {
      observerTargetRef.current = null
      return
    }

    observerTargetRef.current = node

    observerInstanceRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
          loadMoreRef.current()
        }
      },
      { threshold: 0.1 }
    )

    observerInstanceRef.current.observe(node)
  }, [])

  useEffect(() => {
    return () => {
      if (observerInstanceRef.current) {
        observerInstanceRef.current.disconnect()
      }
    }
  }, [])

  return {
    items,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalElements,
    loadMore,
    refresh,
    observerRef: setObserverRef,
  }
}
