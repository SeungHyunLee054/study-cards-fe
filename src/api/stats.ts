import { apiClient } from './client'
import { withApiErrorHandling } from './helpers'
import type { StatsResponse } from '@/types/stats'

export async function fetchStats(): Promise<StatsResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<StatsResponse>('/api/stats')
    return response.data
  }, '통계를 불러오는데 실패했습니다.')
}
