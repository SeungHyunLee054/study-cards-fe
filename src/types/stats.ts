export interface StatsOverview {
  dueToday: number
  totalStudied: number
  newCards: number
  streak: number
  accuracyRate: number  // 전체 정답률 (0.0 ~ 1.0)
}

export interface DeckStats {
  category: string
  newCount: number
  learningCount: number
  reviewCount: number
  masteryRate: number  // 카테고리별 마스터리율 (0.0 ~ 1.0)
}

export interface RecentActivity {
  date: string  // "2025-02-02" 형식
  studied: number
  correct: number
}

export interface StatsResponse {
  overview: StatsOverview
  deckStats: DeckStats[]
  recentActivity: RecentActivity[]
}
