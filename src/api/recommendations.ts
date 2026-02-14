import { apiClient } from './client'
import { withApiErrorHandling } from './helpers'
import type { RecommendationResponse, CategoryAccuracyResponse } from '@/types/recommendation'

// 추천 카드 조회
export async function fetchRecommendations(limit: number = 20): Promise<RecommendationResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<RecommendationResponse>('/api/study/recommendations', {
      params: { limit },
    })
    return response.data
  }, '추천 카드를 불러오는데 실패했습니다.')
}

// 카테고리별 정답률 조회
export async function fetchCategoryAccuracy(): Promise<CategoryAccuracyResponse[]> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<CategoryAccuracyResponse[]>('/api/study/category-accuracy')
    return response.data
  }, '카테고리별 정답률을 불러오는데 실패했습니다.')
}
