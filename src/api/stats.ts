import { apiClient } from './client'
import type { StatsResponse } from '@/types/stats'

export async function fetchStats(): Promise<StatsResponse> {
  const response = await apiClient.get<StatsResponse>('/api/stats')
  return response.data
}
