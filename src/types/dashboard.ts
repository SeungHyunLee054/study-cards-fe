export interface DashboardUser {
  id: number
  nickname: string
  streak: number
  level: number
  totalStudied: number
}

export interface DashboardToday {
  dueCards: number
  newCardsAvailable: number
  studiedToday: number
  todayAccuracy: number
}

export interface CategoryProgressItem {
  categoryCode: string
  totalCards: number
  studiedCards: number
  progressRate: number
  masteryRate: number
}

export interface DashboardActivity {
  date: string
  studied: number
  correct: number
  accuracy: number
}

export type RecommendationType = 'REVIEW' | 'STREAK_KEEP' | 'NEW' | 'COMPLETE'

export interface DashboardRecommendation {
  message: string
  recommendedCategory: string | null
  cardsToStudy: number
  type: RecommendationType
}

export interface DashboardResponse {
  user: DashboardUser
  today: DashboardToday
  categoryProgress: CategoryProgressItem[]
  recentActivity: DashboardActivity[]
  recommendation: DashboardRecommendation
}
