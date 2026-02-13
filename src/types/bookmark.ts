import type { CategoryResponse } from './category'
import type { CardType } from './card'

// 북마크 응답 (백엔드 BookmarkResponse 기준)
export interface BookmarkResponse {
  bookmarkId: number
  cardId: number
  cardType: CardType
  question: string
  questionSub: string | null
  answer: string
  answerSub: string | null
  category: CategoryResponse
  bookmarkedAt: string
}

// 북마크 상태 응답
export interface BookmarkStatusResponse {
  bookmarked: boolean
}
