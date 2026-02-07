import { apiClient, publicClient } from './client'
import { AxiosError } from 'axios'
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
      const code = error.response?.data?.code
      // EMAIL_NOT_VERIFIED 에러 처리
      if (error.response?.status === 403 && code === 'EMAIL_NOT_VERIFIED') {
        const err = new Error(error.response?.data?.message || '이메일 인증이 필요합니다.')
        ;(err as any).code = 'EMAIL_NOT_VERIFIED'
        ;(err as any).email = request.email
        throw err
      }
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

export async function requestEmailVerification(request: EmailVerificationRequest): Promise<void> {
  try {
    await publicClient.post('/api/auth/email-verification/request', request)
  } catch (error) {
    if (error instanceof AxiosError) {
      const code = error.response?.data?.code
      if (code === 'TOO_MANY_ATTEMPTS') {
        throw new Error('인증 코드 요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.')
      }
      throw new Error(error.response?.data?.message || '인증 코드 발송에 실패했습니다.')
    }
    throw error
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
      throw new Error(error.response?.data?.message || '이메일 인증에 실패했습니다.')
    }
    throw error
  }
}

export function getOAuthLoginUrl(provider: OAuthProvider): string {
  const baseUrl = import.meta.env.VITE_API_URL ?? ''
  return `${baseUrl}/oauth2/authorization/${provider}`
}
