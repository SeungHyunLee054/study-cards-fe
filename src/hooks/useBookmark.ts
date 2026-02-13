import { useState, useCallback, useEffect } from 'react'
import type { CardType } from '@/types/card'
import {
  addCardBookmark,
  removeCardBookmark,
  addUserCardBookmark,
  removeUserCardBookmark,
  getCardBookmarkStatus,
  getUserCardBookmarkStatus,
} from '@/api/bookmarks'

interface UseBookmarkOptions {
  cardId: number
  cardType: CardType
  initialBookmarked?: boolean
}

export function useBookmark({ cardId, cardType, initialBookmarked }: UseBookmarkOptions) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked ?? false)
  const [isLoading, setIsLoading] = useState(false)

  // 마운트 시 북마크 상태 확인 (initialBookmarked가 지정되지 않은 경우)
  useEffect(() => {
    if (initialBookmarked !== undefined) return

    let cancelled = false
    async function checkStatus() {
      try {
        const fn = cardType === 'PUBLIC' ? getCardBookmarkStatus : getUserCardBookmarkStatus
        const result = await fn(cardId)
        if (!cancelled) {
          setIsBookmarked(result.bookmarked)
        }
      } catch {
        // 상태 확인 실패 시 무시
      }
    }
    checkStatus()
    return () => { cancelled = true }
  }, [cardId, cardType, initialBookmarked])

  const toggle = useCallback(async () => {
    if (isLoading) return

    const prevState = isBookmarked
    setIsBookmarked(!prevState) // 낙관적 업데이트
    setIsLoading(true)

    try {
      if (prevState) {
        // 북마크 해제
        if (cardType === 'PUBLIC') {
          await removeCardBookmark(cardId)
        } else {
          await removeUserCardBookmark(cardId)
        }
      } else {
        // 북마크 추가
        if (cardType === 'PUBLIC') {
          await addCardBookmark(cardId)
        } else {
          await addUserCardBookmark(cardId)
        }
      }
    } catch {
      setIsBookmarked(prevState) // 실패 시 롤백
    } finally {
      setIsLoading(false)
    }
  }, [cardId, cardType, isBookmarked, isLoading])

  return { isBookmarked, isLoading, toggle }
}
