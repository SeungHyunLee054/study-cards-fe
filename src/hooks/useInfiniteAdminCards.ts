import { useCallback } from 'react'
import { fetchAdminCards } from '@/api/admin'
import { useInfiniteScrollQuery } from '@/hooks/useInfiniteScrollQuery'
import type { AdminCardResponse } from '@/types/admin'

interface UseInfiniteAdminCardsOptions {
  categoryCode?: string
  pageSize?: number
}

interface UseInfiniteAdminCardsReturn {
  cards: AdminCardResponse[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  totalElements: number
  loadMore: () => void
  refresh: () => Promise<void>
  observerRef: (node: HTMLElement | null) => void
}

export function useInfiniteAdminCards(options: UseInfiniteAdminCardsOptions = {}): UseInfiniteAdminCardsReturn {
  const { categoryCode, pageSize = 20 } = options

  const fetchPage = useCallback(
    ({ page, size }: { page: number; size: number }) =>
      fetchAdminCards(categoryCode, { page, size }),
    [categoryCode]
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
  } = useInfiniteScrollQuery<AdminCardResponse>({
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
