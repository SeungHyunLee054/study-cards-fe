export interface Card {
  id: number
  question: string
  answer: string
  efFactor: number
  category: string
  nextReviewAt?: string
  interval?: number
  repetitions?: number
}

export interface StudySession {
  id: number
  cardId: number
  isCorrect: boolean
  studiedAt: string
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface StudyResult {
  cardId: number
  isCorrect: boolean
  difficulty: Difficulty
}
