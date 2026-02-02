// 카드 응답 (백엔드 CardResponse 기준)
export interface CardResponse {
  id: number
  questionEn: string
  questionKo: string
  answerEn: string
  answerKo: string
  efFactor: number
  category: string
  createdAt: string
}

// 학습 답변 요청 (백엔드 StudyAnswerRequest 기준)
export interface StudyAnswerRequest {
  cardId: number
  isCorrect: boolean
}

// 학습 결과 응답
export interface StudyResultResponse {
  cardId: number
  isCorrect: boolean
  nextReviewAt?: string
}

// StudyCard는 CardResponse의 별칭 (호환성)
export type StudyCard = CardResponse

// 기존 Card 타입 (호환성 유지)
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

// 카드 카테고리 타입
export type Category = 'CS' | 'ENGLISH' | 'SQL' | 'JAPANESE'

// 사용자 카드 생성 요청
export interface UserCardCreateRequest {
  questionEn: string
  questionKo?: string
  answerEn: string
  answerKo?: string
  category: Category
}

// 사용자 카드 수정 요청
export interface UserCardUpdateRequest {
  questionEn: string
  questionKo?: string
  answerEn: string
  answerKo?: string
  category: Category
}

// 사용자 카드 응답
export interface UserCardResponse {
  id: number
  questionEn: string
  questionKo: string | null
  answerEn: string
  answerKo: string | null
  efFactor: number
  category: string
  createdAt: string
}
