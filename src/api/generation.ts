import { apiClient } from './client'
import { AxiosError } from 'axios'
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
  try {
    const response = await apiClient.post<GenerationResultResponse>(
      '/api/admin/generation/cards',
      request
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || 'AI 문제 생성에 실패했습니다.')
    }
    throw error
  }
}

// 2. 생성 통계 조회
export async function fetchGenerationStats(): Promise<GenerationStatsResponse> {
  try {
    const response = await apiClient.get<GenerationStatsResponse>('/api/admin/generation/stats')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '생성 통계를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 3. 생성된 문제 목록 (페이지네이션)
export async function fetchGeneratedCards(
  params?: GeneratedCardsParams
): Promise<PageResponse<GeneratedCardResponse>> {
  try {
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
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '생성된 문제 목록을 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 4. 생성된 문제 상세 조회
export async function fetchGeneratedCard(id: number): Promise<GeneratedCardResponse> {
  try {
    const response = await apiClient.get<GeneratedCardResponse>(
      `/api/admin/generation/cards/${id}`
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '문제를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 5. 문제 승인
export async function approveGeneratedCard(id: number): Promise<GeneratedCardResponse> {
  try {
    const response = await apiClient.patch<GeneratedCardResponse>(
      `/api/admin/generation/cards/${id}/approve`
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '문제 승인에 실패했습니다.')
    }
    throw error
  }
}

// 6. 문제 거부
export async function rejectGeneratedCard(id: number): Promise<GeneratedCardResponse> {
  try {
    const response = await apiClient.patch<GeneratedCardResponse>(
      `/api/admin/generation/cards/${id}/reject`
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '문제 거부에 실패했습니다.')
    }
    throw error
  }
}

// 7. 일괄 승인
export async function batchApproveCards(
  request: BatchApproveRequest
): Promise<GeneratedCardResponse[]> {
  try {
    const response = await apiClient.post<GeneratedCardResponse[]>(
      '/api/admin/generation/cards/batch-approve',
      request
    )
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '일괄 승인에 실패했습니다.')
    }
    throw error
  }
}

// 8. Card 테이블로 마이그레이션
export async function migrateApprovedCards(): Promise<MigrationResponse> {
  try {
    const response = await apiClient.post<MigrationResponse>('/api/admin/generation/migrate')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '마이그레이션에 실패했습니다.')
    }
    throw error
  }
}
