export type AiDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface GenerateUserCardRequest {
  sourceText: string
  categoryCode: string
  count: number
  difficulty?: AiDifficulty
}

export interface GenerateUserCardsByUploadRequest {
  file: File
  categoryCode: string
  count?: number
  difficulty?: AiDifficulty
}

export interface AiCardResponse {
  id: number
  question: string
  questionSub: string | null
  answer: string
  answerSub: string | null
  categoryCode: string
  aiGenerated: boolean
}

export interface UserAiGenerationResponse {
  generatedCards: AiCardResponse[]
  count: number
  remainingLimit: number
}

export interface AiLimitResponse {
  limit: number
  used: number
  remaining: number
  isLifetime: boolean
}
