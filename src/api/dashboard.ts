import { apiClient } from './client'
import { AxiosError } from 'axios'
import type { DashboardResponse } from '@/types/dashboard'

export async function fetchDashboard(): Promise<DashboardResponse> {
  try {
    const response = await apiClient.get<DashboardResponse>('/api/dashboard')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '대시보드 정보를 불러오는데 실패했습니다.')
    }
    throw error
  }
}
