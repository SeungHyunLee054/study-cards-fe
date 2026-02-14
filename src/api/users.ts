import { apiClient } from './client'
import { withApiErrorHandling } from './helpers'
import type {
  UserProfileResponse,
  UserProfileUpdateRequest,
  PasswordChangeRequest,
} from '@/types/user'

export async function fetchUserProfile(): Promise<UserProfileResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<UserProfileResponse>('/api/users/me')
    return response.data
  }, '사용자 정보를 불러오는데 실패했습니다.')
}

export async function updateUserProfile(
  request: UserProfileUpdateRequest
): Promise<UserProfileResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.patch<UserProfileResponse>('/api/users/me', request)
    return response.data
  }, '프로필 수정에 실패했습니다.')
}

export async function changePassword(request: PasswordChangeRequest): Promise<void> {
  return withApiErrorHandling(async () => {
    await apiClient.patch('/api/users/me/password', request)
  }, '비밀번호 변경에 실패했습니다.')
}
