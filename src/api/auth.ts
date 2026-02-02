import { apiClient, publicClient } from './client'
import { AxiosError } from 'axios'
import type {
  SignUpRequest,
  SignInRequest,
  SignInResponse,
  UserResponse,
  PasswordResetRequest,
  PasswordResetVerifyRequest,
  OAuthProvider,
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

export async function requestPasswordReset(request: PasswordResetRequest): Promise<void> {
  try {
    await publicClient.post('/api/auth/password-reset/request', request)
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '비밀번호 재설정 요청에 실패했습니다.')
    }
    throw error
  }
}

export async function verifyPasswordReset(request: PasswordResetVerifyRequest): Promise<void> {
  try {
    await publicClient.post('/api/auth/password-reset/verify', request)
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '비밀번호 재설정에 실패했습니다.')
    }
    throw error
  }
}

export function getOAuthLoginUrl(provider: OAuthProvider): string {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081'
  return `${baseUrl}/oauth2/authorization/${provider}`
}
