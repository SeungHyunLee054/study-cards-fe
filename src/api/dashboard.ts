import { apiClient } from './client'
import { withApiErrorHandling } from './helpers'
import type { DashboardResponse } from '@/types/dashboard'

export async function fetchDashboard(): Promise<DashboardResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<DashboardResponse>('/api/dashboard')
    return response.data
  }, '대시보드 정보를 불러오는데 실패했습니다.')
}
