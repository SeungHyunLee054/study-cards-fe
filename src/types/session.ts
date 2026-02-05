export interface SessionResponse {
  id: number
  startedAt: string
  endedAt: string | null
  totalCards: number
  correctCount: number
  accuracyRate: number
  durationSeconds: number | null
}

export interface StudyRecordResponse {
  id: number
  cardId: number
  userCardId: number | null
  question: string
  isCorrect: boolean
  studiedAt: string
}

export interface SessionStatsResponse extends SessionResponse {
  records: StudyRecordResponse[]
}
