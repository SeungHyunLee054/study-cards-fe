import { apiClient } from './client'
import { AxiosError } from 'axios'
import type { RecommendationResponse, CategoryAccuracyResponse } from '@/types/recommendation'

// 추천 카드 조회
export async function fetchRecommendations(limit: number = 20): Promise<RecommendationResponse> {
  try {
    const response = await apiClient.get<RecommendationResponse>('/api/study/recommendations', {
      params: { limit },
    })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '추천 카드를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 카테고리별 정답률 조회
export async function fetchCategoryAccuracy(): Promise<CategoryAccuracyResponse[]> {
  try {
    const response = await apiClient.get<CategoryAccuracyResponse[]>('/api/study/category-accuracy')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카테고리별 정답률을 불러오는데 실패했습니다.')
    }
    throw error
  }
}
