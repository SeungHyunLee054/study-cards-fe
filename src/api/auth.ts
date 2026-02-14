import { AxiosError } from 'axios'
import { apiClient, publicClient } from './client'
import { withApiErrorHandling, toAppError } from './helpers'
import { AuthError } from '@/types/errors'
import type {
  SignUpRequest,
  SignInRequest,
  SignInResponse,
  UserResponse,
  PasswordResetRequest,
  PasswordResetVerifyRequest,
  EmailVerificationRequest,
  EmailVerificationVerifyRequest,
  OAuthProvider,
} from '@/types/auth'

export async function signUp(request: SignUpRequest): Promise<UserResponse> {
  return withApiErrorHandling(async () => {
    const response = await publicClient.post<UserResponse>('/api/auth/signup', request)
    return response.data
  }, '회원가입에 실패했습니다.')
}

export async function signIn(request: SignInRequest): Promise<SignInResponse> {
  try {
    const response = await publicClient.post<SignInResponse>('/api/auth/signin', request)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      const code = error.response?.data?.code
      if (error.response?.status === 403 && code === 'EMAIL_NOT_VERIFIED') {
        throw new AuthError(
          error.response?.data?.message || '이메일 인증이 필요합니다.',
          'EMAIL_NOT_VERIFIED',
          request.email
        )
      }
    }
    return toAppError(error, '로그인에 실패했습니다.')
  }
}

export async function signOut(): Promise<void> {
  return withApiErrorHandling(async () => {
    await apiClient.post('/api/auth/signout')
  }, '로그아웃에 실패했습니다.')
}

export async function refreshToken(): Promise<SignInResponse> {
  return withApiErrorHandling(async () => {
    const response = await publicClient.post<SignInResponse>('/api/auth/refresh')
    return response.data
  }, '토큰 갱신에 실패했습니다.')
}

export async function requestPasswordReset(request: PasswordResetRequest): Promise<void> {
  return withApiErrorHandling(async () => {
    await publicClient.post('/api/auth/password-reset/request', request)
  }, '비밀번호 재설정 요청에 실패했습니다.')
}

export async function verifyPasswordReset(request: PasswordResetVerifyRequest): Promise<void> {
  return withApiErrorHandling(async () => {
    await publicClient.post('/api/auth/password-reset/verify', request)
  }, '비밀번호 재설정에 실패했습니다.')
}

export async function requestEmailVerification(request: EmailVerificationRequest): Promise<void> {
  try {
    await publicClient.post('/api/auth/email-verification/request', request)
  } catch (error) {
    if (error instanceof AxiosError) {
      const code = error.response?.data?.code
      if (code === 'TOO_MANY_ATTEMPTS') {
        throw new Error('인증 코드 요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.')
      }
    }
    return toAppError(error, '인증 코드 발송에 실패했습니다.')
  }
}

export async function verifyEmailVerification(request: EmailVerificationVerifyRequest): Promise<void> {
  try {
    await publicClient.post('/api/auth/email-verification/verify', request)
  } catch (error) {
    if (error instanceof AxiosError) {
      const code = error.response?.data?.code
      if (code === 'INVALID_CODE') {
        throw new Error('잘못된 인증 코드입니다.')
      }
      if (code === 'EXPIRED_CODE') {
        throw new Error('인증 코드가 만료되었습니다. 새 코드를 요청해주세요.')
      }
      if (code === 'TOO_MANY_ATTEMPTS') {
        throw new Error('인증 시도 횟수를 초과했습니다. 새 코드를 요청해주세요.')
      }
    }
    return toAppError(error, '이메일 인증에 실패했습니다.')
  }
}

export function getOAuthLoginUrl(provider: OAuthProvider): string {
  const baseUrl = import.meta.env.VITE_API_URL ?? ''
  return `${baseUrl}/oauth2/authorization/${provider}`
}
