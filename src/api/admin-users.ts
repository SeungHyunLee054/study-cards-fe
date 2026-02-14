import { apiClient } from './client'
import { withApiErrorHandling } from './helpers'
import type { AdminUserResponse, AdminUserStatus } from '@/types/admin'
import type { PageResponse } from '@/types/card'

export interface AdminUsersParams {
  status?: AdminUserStatus
  page?: number
  size?: number
}

export async function fetchAdminUsers(
  params?: AdminUsersParams
): Promise<PageResponse<AdminUserResponse>> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<PageResponse<AdminUserResponse>>('/api/admin/users', {
      params: {
        ...(params?.status && { status: params.status }),
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    })
    return response.data
  }, '사용자 목록을 불러오는데 실패했습니다.')
}

export async function fetchAdminUser(userId: number): Promise<AdminUserResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<AdminUserResponse>(`/api/admin/users/${userId}`)
    return response.data
  }, '사용자 정보를 불러오는데 실패했습니다.')
}

export async function withdrawAdminUser(userId: number): Promise<void> {
  return withApiErrorHandling(async () => {
    await apiClient.delete(`/api/admin/users/${userId}`)
  }, '사용자 탈퇴 처리에 실패했습니다.')
}
