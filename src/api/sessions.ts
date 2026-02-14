import { apiClient } from './client'
import { withApiErrorHandling } from './helpers'
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
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<SessionResponse | null>(
      '/api/study/sessions/current'
    )
    return response.data
  }, '현재 세션을 불러오는데 실패했습니다.')
}

export async function endCurrentSession(): Promise<SessionResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.put<SessionResponse>(
      '/api/study/sessions/end'
    )
    return response.data
  }, '세션 종료에 실패했습니다.')
}

export async function getSessions(
  params: SessionsParams = {}
): Promise<PageResponse<SessionResponse>> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<PageResponse<SessionResponse>>(
      '/api/study/sessions',
      { params }
    )
    return response.data
  }, '세션 목록을 불러오는데 실패했습니다.')
}

export async function getSession(sessionId: number): Promise<SessionResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<SessionResponse>(
      `/api/study/sessions/${sessionId}`
    )
    return response.data
  }, '세션 정보를 불러오는데 실패했습니다.')
}

export async function getSessionStats(
  sessionId: number
): Promise<SessionStatsResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<SessionStatsResponse>(
      `/api/study/sessions/${sessionId}/stats`
    )
    return response.data
  }, '세션 통계를 불러오는데 실패했습니다.')
}
