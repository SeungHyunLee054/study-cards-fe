import { apiClient, publicClient } from './client'
import { AxiosError } from 'axios'
import type { CardResponse, PageResponse } from '@/types/card'

// 카드 검색 (인증 선택적 - 인증 시 사용자 카드도 포함)
export async function searchCards(params: {
  keyword: string
  category?: string
  page?: number
  size?: number
}): Promise<PageResponse<CardResponse>> {
  try {
    const client = localStorage.getItem('accessToken') ? apiClient : publicClient
    const response = await client.get<PageResponse<CardResponse>>('/api/cards/search', {
      params: {
        keyword: params.keyword,
        ...(params.category && { category: params.category }),
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카드 검색에 실패했습니다.')
    }
    throw error
  }
}
