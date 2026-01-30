import { apiClient, publicClient } from './client'
import { AxiosError } from 'axios'
import type {
  SignUpRequest,
  SignInRequest,
  SignInResponse,
  UserResponse,
} from '@/types/auth'

export async function signUp(request: SignUpRequest): Promise<UserResponse> {
  try {
    const response = await publicClient.post<UserResponse>('/api/auth/signup', request)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '회원가입에 실패했습니다.')
    }
    throw error
  }
}

export async function signIn(request: SignInRequest): Promise<SignInResponse> {
  try {
    const response = await publicClient.post<SignInResponse>('/api/auth/signin', request)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '로그인에 실패했습니다.')
    }
    throw error
  }
}

export async function signOut(): Promise<void> {
  try {
    await apiClient.post('/api/auth/signout')
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '로그아웃에 실패했습니다.')
    }
    throw error
  }
}

export async function refreshToken(): Promise<SignInResponse> {
  try {
    const response = await publicClient.post<SignInResponse>('/api/auth/refresh')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '토큰 갱신에 실패했습니다.')
    }
    throw error
  }
}
