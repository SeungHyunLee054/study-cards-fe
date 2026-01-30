import { useState, useCallback } from 'react'
import type { Card, StudyResult, Difficulty } from '@/types/card'
import { fetchDueCards, submitStudyResult } from '@/api/cards'

interface UseStudyCardsReturn {
  cards: Card[]
  currentCard: Card | null
  currentIndex: number
  isLoading: boolean
  error: string | null
  isFlipped: boolean
  loadCards: () => Promise<void>
  flipCard: () => void
  answerCard: (isCorrect: boolean, difficulty?: Difficulty) => Promise<void>
  nextCard: () => void
  prevCard: () => void
  progress: {
    total: number
    completed: number
    correct: number
  }
}

export function useStudyCards(): UseStudyCardsReturn {
  const [cards, setCards] = useState<Card[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [completed, setCompleted] = useState(0)
  const [correct, setCorrect] = useState(0)

  const currentCard = cards[currentIndex] ?? null

  const loadCards = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchDueCards()
      setCards(data)
      setCurrentIndex(0)
      setIsFlipped(false)
      setCompleted(0)
      setCorrect(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cards')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const flipCard = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  const answerCard = useCallback(
    async (isCorrect: boolean, difficulty: Difficulty = 'medium') => {
      if (!currentCard) return

      try {
        const result: StudyResult = {
          cardId: currentCard.id,
          isCorrect,
          difficulty,
        }
        const updatedCard = await submitStudyResult(result)

        setCards((prev) =>
          prev.map((c) => (c.id === updatedCard.id ? updatedCard : c))
        )

        setCompleted((prev) => prev + 1)
        if (isCorrect) {
          setCorrect((prev) => prev + 1)
        }

        if (currentIndex < cards.length - 1) {
          setCurrentIndex((prev) => prev + 1)
          setIsFlipped(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit answer')
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
    loadCards,
    flipCard,
    answerCard,
    nextCard,
    prevCard,
    progress: {
      total: cards.length,
      completed,
      correct,
    },
  }
}
