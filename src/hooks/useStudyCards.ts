import { useState, useCallback, useRef } from 'react'
import { AxiosError } from 'axios'
import type { CardResponse } from '@/types/card'
import { fetchStudyCards } from '@/api/cards'

interface UseStudyCardsReturn {
  cards: CardResponse[]
  currentCard: CardResponse | null
  currentIndex: number
  isLoading: boolean
  error: string | null
  isFlipped: boolean
  isRateLimited: boolean
  loadCards: (category?: string) => Promise<void>
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
  const [cards, setCards] = useState<CardResponse[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [completed, setCompleted] = useState(0)
  const [correct, setCorrect] = useState(0)
  const isLoadingRef = useRef(false)

  const currentCard = cards[currentIndex] ?? null

  const loadCards = useCallback(async (category?: string) => {
    if (isLoadingRef.current) return
    isLoadingRef.current = true
    setIsLoading(true)
    setError(null)
    setIsRateLimited(false)
    try {
      const data = await fetchStudyCards(category)
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

      // TODO: 유저별 EF Factor 구현 후 API 호출 활성화
      // const request: StudyAnswerRequest = {
      //   cardId: currentCard.id,
      //   isCorrect,
      // }
      // await submitStudyAnswer(request)

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
