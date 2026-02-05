import type { CategoryResponse } from './category'

export type GeneratedCardStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MIGRATED'

export interface GeneratedCardResponse {
  id: number
  model: string
  sourceWord: string
  question: string
  questionSub: string | null
  answer: string
  answerSub: string | null
  category: CategoryResponse
  status: GeneratedCardStatus
  approvedAt: string | null
  createdAt: string
}

export interface GenerationRequest {
  categoryCode: string
  count: number
  model?: string
}

export interface GenerationResultResponse {
  generatedCards: GeneratedCardResponse[]
  totalGenerated: number
  categoryCode: string
  model: string
}

export interface ModelStats {
  model: string
  totalGenerated: number
  approved: number
  rejected: number
  pending: number
  migrated: number
  approvalRate: number
}

export interface GenerationStatsResponse {
  byModel: ModelStats[]
  overall: {
    totalGenerated: number
    approved: number
    rejected: number
    pending: number
    migrated: number
    approvalRate: number
  }
}

export interface BatchApproveRequest {
  ids: number[]
}

export interface MigrationResponse {
  migratedCount: number
  message: string
}

export interface GeneratedCardsParams {
  page?: number
  size?: number
  status?: GeneratedCardStatus
  model?: string
}
