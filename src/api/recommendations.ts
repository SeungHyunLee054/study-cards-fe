import { apiClient } from './client'
import { withApiErrorHandling } from './helpers'
import type { PageResponse } from '@/types/card'
import type {
  RecommendationResponse,
  CategoryAccuracyResponse,
  AiRecommendationResponse,
  AiRecommendationHistoryResponse,
} from '@/types/recommendation'

// 추천 카드 조회
export async function fetchRecommendations(limit: number = 20): Promise<RecommendationResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<RecommendationResponse>('/api/study/recommendations', {
      params: { limit },
    })
    return response.data
  }, '추천 카드를 불러오는데 실패했습니다.')
}

// AI 추천 카드 조회 (PRO 전용, FREE는 403)
export async function fetchAiRecommendations(limit: number = 20): Promise<AiRecommendationResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<AiRecommendationResponse>('/api/study/recommendations/ai', {
      params: { limit },
    })
    return response.data
  }, 'AI 추천 카드를 불러오는데 실패했습니다.', [403])
}

// AI 복습 추천 히스토리 조회
export async function fetchAiRecommendationHistory(
  page: number = 0,
  size: number = 10
): Promise<PageResponse<AiRecommendationHistoryResponse>> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<PageResponse<AiRecommendationHistoryResponse>>(
      '/api/study/recommendations/ai/history',
      {
        params: { page, size },
      }
    )
    return response.data
  }, 'AI 복습 히스토리를 불러오는데 실패했습니다.')
}

// 카테고리별 정답률 조회
export async function fetchCategoryAccuracy(): Promise<CategoryAccuracyResponse[]> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<CategoryAccuracyResponse[]>('/api/study/category-accuracy')
    return response.data
  }, '카테고리별 정답률을 불러오는데 실패했습니다.')
}
