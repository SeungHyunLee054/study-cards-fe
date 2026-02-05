import { AxiosError } from 'axios'
import { apiClient } from './client'
import type { StatsResponse } from '@/types/stats'

export async function fetchStats(): Promise<StatsResponse> {
  try {
    const response = await apiClient.get<StatsResponse>('/api/stats')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '통계를 불러오는데 실패했습니다.')
    }
    throw error
  }
}
