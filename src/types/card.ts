import type { CategoryResponse } from './category'

// Spring Page 응답 타입
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number // 현재 페이지 (0-based)
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

// 카드 타입 (PUBLIC: 공용 카드, CUSTOM: 사용자 카드)
export type CardType = 'PUBLIC' | 'CUSTOM'

// 카드 응답 (백엔드 CardResponse 기준)
export interface CardResponse {
  id: number
  question: string
  questionSub: string | null
  answer: string
  answerSub: string | null
  efFactor: number
  category: CategoryResponse
  cardType: CardType
  createdAt: string
}

// 사용자 카드 응답 (백엔드 UserCardResponse 기준)
export interface UserCardResponse {
  id: number
  question: string
  questionSub: string | null
  answer: string
  answerSub: string | null
  efFactor: number
  category: CategoryResponse
  cardType: CardType
  createdAt: string
}

// 오늘의 학습 카드 응답 (백엔드 StudyCardResponse 기준)
export interface StudyCardResponse {
  id: number
  question: string
  questionSub: string | null
  answer: string
  answerSub: string | null
  category: CategoryResponse
  cardType: CardType
}

// 학습용 카드 공통 타입
export type StudyCard = CardResponse | UserCardResponse | StudyCardResponse

// 학습 답변 요청 (백엔드 StudyAnswerRequest 기준)
export interface StudyAnswerRequest {
  cardId: number
  cardType: CardType
  isCorrect: boolean
}

// 학습 결과 응답 (백엔드 StudyResultResponse 기준)
export interface StudyResultResponse {
  cardId: number
  isCorrect: boolean
  nextReviewDate: string | null
  newEfFactor: number | null
}

// 사용자 카드 생성 요청
export interface UserCardCreateRequest {
  question: string
  questionSub?: string
  answer: string
  answerSub?: string
  category: string
}

// 사용자 카드 수정 요청
export interface UserCardUpdateRequest {
  question: string
  questionSub?: string
  answer: string
  answerSub?: string
  category: string
}
