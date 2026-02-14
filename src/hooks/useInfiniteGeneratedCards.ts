import { useCallback } from 'react'
import { fetchGeneratedCards } from '@/api/generation'
import { useInfiniteScrollQuery } from '@/hooks/useInfiniteScrollQuery'
import type { GeneratedCardResponse, GeneratedCardStatus } from '@/types/generation'

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

  const fetchPage = useCallback(
    ({ page, size }: { page: number; size: number }) =>
      fetchGeneratedCards({
        page,
        size,
        status,
        model,
      }),
    [status, model]
  )

  const {
    items,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalElements,
    loadMore,
    refresh,
    observerRef,
  } = useInfiniteScrollQuery<GeneratedCardResponse>({
    fetchPage,
    pageSize,
  })

  return {
    cards: items,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    totalElements,
    loadMore,
    refresh,
    observerRef,
  }
}
