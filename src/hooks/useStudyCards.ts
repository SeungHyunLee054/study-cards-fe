import { useState, useCallback, useRef } from 'react'
import { AxiosError } from 'axios'
import type { StudyCard } from '@/types/card'
import {
  fetchStudyCards,
  fetchUserStudyCards,
  fetchTodayStudyCards,
  fetchAllStudyCards,
  fetchCard,
  submitStudyAnswer,
} from '@/api/cards'

type StudyMode = 'all' | 'review' | 'myCards' | 'session-review' | 'recommended'

interface UseStudyCardsReturn {
  cards: StudyCard[]
  currentCard: StudyCard | null
  currentIndex: number
  isLoading: boolean
  error: string | null
  isFlipped: boolean
  isRateLimited: boolean
  studyMode: StudyMode
  loadCards: (category?: string, mode?: StudyMode, cardIds?: number[], isLoggedIn?: boolean) => Promise<void>
  flipCard: () => void
  answerCard: (isCorrect: boolean) => void
  nextCard: () => void
  prevCard: () => void
  clearRateLimitError: () => void
  progress: {
    total: number
    completed: number
    correct: number
  }
}

export function useStudyCards(): UseStudyCardsReturn {
  const [cards, setCards] = useState<StudyCard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [completed, setCompleted] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [studyMode, setStudyMode] = useState<StudyMode>('all')
  const isLoadingRef = useRef(false)

  const currentCard = cards[currentIndex] ?? null

  const loadCards = useCallback(async (category?: string, mode: StudyMode = 'all', cardIds?: number[], isLoggedIn = false) => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    setIsLoading(true)
    setError(null)
    setIsRateLimited(false)
    setStudyMode(mode)

    try {
      let data: StudyCard[]

      if (mode === 'session-review' && cardIds && cardIds.length > 0) {
        // 세션 복습: cardIds로 개별 카드 조회
        const cardPromises = cardIds.map((id) => fetchCard(id))
        data = await Promise.all(cardPromises)
      } else if (mode === 'myCards') {
        // 내 카드만 학습
        data = await fetchUserStudyCards(category)
      } else if (mode === 'review' && isLoggedIn) {
        // SM-2 기반 오늘 복습할 카드 (로그인 필수)
        data = await fetchTodayStudyCards(category)
      } else {
        // 전체 학습 (로그인 시 내 카드 포함, 비로그인 시 공용 카드만)
        data = isLoggedIn
          ? await fetchAllStudyCards(category)
          : await fetchStudyCards(category)
      }

      setCards(data)
      setCurrentIndex(0)
      setIsFlipped(false)
      setCompleted(0)
      setCorrect(0)
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 429) {
        setIsRateLimited(true)
      } else {
        setError(err instanceof Error ? err.message : '카드를 불러오는데 실패했습니다.')
      }
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [])

  const clearRateLimitError = useCallback(() => {
    setIsRateLimited(false)
  }, [])

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  const answerCard = useCallback(
    (isCorrect: boolean) => {
      if (!currentCard) return

      // 로그인 상태일 때만 학습 결과 저장
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        submitStudyAnswer({
          cardId: currentCard.id,
          cardType: currentCard.cardType,
          isCorrect,
        }).catch(() => {
          // 학습 결과 저장 실패해도 UI는 계속 진행
        })
      }

      setCompleted((prev) => prev + 1)
      if (isCorrect) {
        setCorrect((prev) => prev + 1)
      }

      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1)
        setIsFlipped(false)
      }
    },
    [currentCard, currentIndex, cards.length]
  )

  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setIsFlipped(false)
    }
  }, [currentIndex, cards.length])

  const prevCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setIsFlipped(false)
    }
  }, [currentIndex])

  return {
    cards,
    currentCard,
    currentIndex,
    isLoading,
    error,
    isFlipped,
    isRateLimited,
    studyMode,
    loadCards,
    flipCard,
    answerCard,
    nextCard,
    prevCard,
    clearRateLimitError,
    progress: {
      total: cards.length,
      completed,
      correct,
    },
  }
}
