import type { CategoryResponse } from './category'

export interface AdminCardCreateRequest {
  question: string
  questionSub?: string
  answer: string
  answerSub?: string
  category: string
}

export interface AdminCardUpdateRequest {
  question: string
  questionSub?: string
  answer: string
  answerSub?: string
  category: string
}

export interface AdminCardResponse {
  id: number
  question: string
  questionSub: string | null
  answer: string
  answerSub: string | null
  efFactor: number
  category: CategoryResponse
  createdAt: string
}
