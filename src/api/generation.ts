import { apiClient } from './client'
import { withApiErrorHandling } from './helpers'
import type { PageResponse } from '@/types/card'
import type {
  GeneratedCardResponse,
  GenerationRequest,
  GenerationResultResponse,
  GenerationStatsResponse,
  GeneratedCardsParams,
  BatchApproveRequest,
  MigrationResponse,
} from '@/types/generation'

// 1. AI 문제 생성
export async function generateCards(request: GenerationRequest): Promise<GenerationResultResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.post<GenerationResultResponse>(
      '/api/admin/generation/cards',
      request
    )
    return response.data
  }, 'AI 문제 생성에 실패했습니다.')
}

// 2. 생성 통계 조회
export async function fetchGenerationStats(): Promise<GenerationStatsResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<GenerationStatsResponse>('/api/admin/generation/stats')
    return response.data
  }, '생성 통계를 불러오는데 실패했습니다.')
}

// 3. 생성된 문제 목록 (페이지네이션)
export async function fetchGeneratedCards(
  params?: GeneratedCardsParams
): Promise<PageResponse<GeneratedCardResponse>> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<PageResponse<GeneratedCardResponse>>(
      '/api/admin/generation/cards',
      {
        params: {
          page: params?.page ?? 0,
          size: params?.size ?? 20,
          ...(params?.status && { status: params.status }),
          ...(params?.model && { model: params.model }),
        },
      }
    )
    return response.data
  }, '생성된 문제 목록을 불러오는데 실패했습니다.')
}

// 4. 생성된 문제 상세 조회
export async function fetchGeneratedCard(id: number): Promise<GeneratedCardResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<GeneratedCardResponse>(
      `/api/admin/generation/cards/${id}`
    )
    return response.data
  }, '문제를 불러오는데 실패했습니다.')
}

// 5. 문제 승인
export async function approveGeneratedCard(id: number): Promise<GeneratedCardResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.patch<GeneratedCardResponse>(
      `/api/admin/generation/cards/${id}/approve`
    )
    return response.data
  }, '문제 승인에 실패했습니다.')
}

// 6. 문제 거부
export async function rejectGeneratedCard(id: number): Promise<GeneratedCardResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.patch<GeneratedCardResponse>(
      `/api/admin/generation/cards/${id}/reject`
    )
    return response.data
  }, '문제 거부에 실패했습니다.')
}

// 7. 일괄 승인
export async function batchApproveCards(
  request: BatchApproveRequest
): Promise<GeneratedCardResponse[]> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.post<GeneratedCardResponse[]>(
      '/api/admin/generation/cards/batch-approve',
      request
    )
    return response.data
  }, '일괄 승인에 실패했습니다.')
}

// 8. Card 테이블로 마이그레이션
export async function migrateApprovedCards(): Promise<MigrationResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.post<MigrationResponse>('/api/admin/generation/migrate')
    return response.data
  }, '마이그레이션에 실패했습니다.')
}
