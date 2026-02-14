import { withApiErrorHandling, getOptionalAuthClient } from './helpers'
import type { CardResponse, PageResponse } from '@/types/card'

// 카드 검색 (인증 선택적 - 인증 시 사용자 카드도 포함)
export async function searchCards(params: {
  keyword: string
  category?: string
  page?: number
  size?: number
}): Promise<PageResponse<CardResponse>> {
  return withApiErrorHandling(async () => {
    const client = getOptionalAuthClient()
    const response = await client.get<PageResponse<CardResponse>>('/api/cards/search', {
      params: {
        keyword: params.keyword,
        ...(params.category && { category: params.category }),
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    })
    return response.data
  }, '카드 검색에 실패했습니다.')
}
