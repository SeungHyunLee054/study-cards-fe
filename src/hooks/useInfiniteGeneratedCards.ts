import { useState, useCallback, useRef, useEffect } from 'react'
import type { GeneratedCardResponse, GeneratedCardStatus } from '@/types/generation'
import { fetchGeneratedCards } from '@/api/generation'

interface UseInfiniteGeneratedCardsOptions {
  status?: GeneratedCardStatus
  model?: string
  pageSize?: number
}

interface UseInfiniteGeneratedCardsReturn {
  cards: GeneratedCardResponse[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  totalElements: number
  loadMore: () => void
  refresh: () => Promise<void>
  observerRef: (node: HTMLElement | null) => void
}

export function useInfiniteGeneratedCards(
  options: UseInfiniteGeneratedCardsOptions = {}
): UseInfiniteGeneratedCardsReturn {
  const { status, model, pageSize = 20 } = options

  const [cards, setCards] = useState<GeneratedCardResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [totalElements, setTotalElements] = useState(0)
  const [page, setPage] = useState(0)

  const isLoadingRef = useRef(false)
  const observerTargetRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const hasMoreRef = useRef(hasMore)
  const loadMoreRef = useRef<() => void>(() => {})

  // 초기 로드 및 필터 변경 시 리셋
  const loadInitial = useCallback(async () => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetchGeneratedCards({
        page: 0,
        size: pageSize,
        status,
        model,
      })
      setCards(response.content)
      setHasMore(!response.last)
      setTotalElements(response.totalElements)
      setPage(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성된 카드를 불러오는데 실패했습니다')
      setCards([])
      setHasMore(false)
      setTotalElements(0)
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [status, model, pageSize])

  // 다음 페이지 로드
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return
    isLoadingRef.current = true
    setIsLoadingMore(true)

    try {
      const nextPage = page + 1
      const response = await fetchGeneratedCards({
        page: nextPage,
        size: pageSize,
        status,
        model,
      })
      setCards((prev) => [...prev, ...response.content])
      setHasMore(!response.last)
      setPage(nextPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : '더 불러오는데 실패했습니다')
    } finally {
      setIsLoadingMore(false)
      isLoadingRef.current = false
    }
  }, [status, model, pageSize, page, hasMore])

  // 새로고침
  const refresh = useCallback(async () => {
    setPage(0)
    setHasMore(true)
    await loadInitial()
  }, [loadInitial])

  // ref 동기화
  useEffect(() => {
    hasMoreRef.current = hasMore
  }, [hasMore])

  useEffect(() => {
    loadMoreRef.current = loadMore
  }, [loadMore])

  // 필터 변경 시 리셋
  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  // IntersectionObserver 설정
  const setObserverRef = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    if (!node) {
      observerTargetRef.current = null
      return
    }

    observerTargetRef.current = node

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
          loadMoreRef.current()
        }
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(node)
  }, [])

  // 클린업
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return {
    cards,
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
