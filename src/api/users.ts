import { apiClient } from './client'
import { AxiosError } from 'axios'
import type {
  UserProfileResponse,
  UserProfileUpdateRequest,
  PasswordChangeRequest,
} from '@/types/user'

export async function fetchUserProfile(): Promise<UserProfileResponse> {
  try {
    const response = await apiClient.get<UserProfileResponse>('/api/users/me')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '사용자 정보를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

export async function updateUserProfile(
  request: UserProfileUpdateRequest
): Promise<UserProfileResponse> {
  try {
    const response = await apiClient.patch<UserProfileResponse>('/api/users/me', request)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '프로필 수정에 실패했습니다.')
    }
    throw error
  }
}

export async function changePassword(request: PasswordChangeRequest): Promise<void> {
  try {
    await apiClient.patch('/api/users/me/password', request)
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '비밀번호 변경에 실패했습니다.')
    }
    throw error
  }
}
