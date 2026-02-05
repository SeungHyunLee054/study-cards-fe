import { apiClient } from './client'
import type { PageResponse } from '@/types/card'
import type {
  SessionResponse,
  SessionStatsResponse,
} from '@/types/session'

export interface SessionsParams {
  page?: number
  size?: number
}

export async function getCurrentSession(): Promise<SessionResponse | null> {
  const response = await apiClient.get<SessionResponse | null>(
    '/api/study/sessions/current'
  )
  return response.data
}

export async function endCurrentSession(): Promise<SessionResponse> {
  const response = await apiClient.put<SessionResponse>(
    '/api/study/sessions/end'
  )
  return response.data
}

export async function getSessions(
  params: SessionsParams = {}
): Promise<PageResponse<SessionResponse>> {
  const response = await apiClient.get<PageResponse<SessionResponse>>(
    '/api/study/sessions',
    { params }
  )
  return response.data
}

export async function getSession(sessionId: number): Promise<SessionResponse> {
  const response = await apiClient.get<SessionResponse>(
    `/api/study/sessions/${sessionId}`
  )
  return response.data
}

export async function getSessionStats(
  sessionId: number
): Promise<SessionStatsResponse> {
  const response = await apiClient.get<SessionStatsResponse>(
    `/api/study/sessions/${sessionId}/stats`
  )
  return response.data
}
