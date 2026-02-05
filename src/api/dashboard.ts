import { apiClient } from './client'
import type { DashboardResponse } from '@/types/dashboard'

export async function fetchDashboard(): Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>('/api/dashboard')
  return response.data
}
