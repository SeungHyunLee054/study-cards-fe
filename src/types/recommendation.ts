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
