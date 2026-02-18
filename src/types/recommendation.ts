// 추천 카드
export interface RecommendedCard {
  cardId: number | null
  userCardId: number | null
  question: string
  questionSub: string | null
  priorityScore: number
  nextReviewDate: string
  efFactor: number
  lastCorrect: boolean
}

// 추천 응답
export interface RecommendationResponse {
  recommendations: RecommendedCard[]
  totalCount: number
  aiExplanation: string | null
}

export interface AiRecommendationWeakConcept {
  concept: string
  reason: string
}

export interface AiRecommendationQuota {
  limit: number
  used: number
  remaining: number
  resetAt: string
}

export interface AiRecommendationResponse {
  recommendations: RecommendedCard[]
  totalCount: number
  weakConcepts: AiRecommendationWeakConcept[]
  reviewStrategy: string
  aiUsed: boolean
  algorithmFallback: boolean
  quota: AiRecommendationQuota | null
}

export type AiRecommendationHistoryType = 'USER_CARD' | 'RECOMMENDATION' | 'WEAKNESS_ANALYSIS'

export interface AiRecommendationHistoryResponse {
  id: number
  type: AiRecommendationHistoryType
  model: string | null
  cardsGenerated: number | null
  success: boolean
  errorMessage: string | null
  prompt: string | null
  response: string | null
  createdAt: string
}

// 카테고리별 정답률 응답
export interface CategoryAccuracyResponse {
  categoryId: number
  categoryCode: string
  categoryName: string
  totalCount: number
  correctCount: number
  accuracy: number
}

// 우선순위 레벨
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'normal'
