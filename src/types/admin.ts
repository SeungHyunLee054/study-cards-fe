import type { Category } from './card'

export interface AdminCardCreateRequest {
  questionEn: string
  questionKo?: string
  answerEn: string
  answerKo?: string
  category: Category
  efFactor?: number
}

export interface AdminCardUpdateRequest {
  questionEn?: string
  questionKo?: string
  answerEn?: string
  answerKo?: string
  category?: Category
  efFactor?: number
}

export interface AdminCardResponse {
  id: number
  questionEn: string
  questionKo: string | null
  answerEn: string
  answerKo: string | null
  efFactor: number
  category: string
  createdAt: string
}
