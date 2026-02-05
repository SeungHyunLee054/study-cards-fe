// 회원가입 요청
export interface SignUpRequest {
  email: string
  password: string
  passwordConfirm: string
  nickname: string
}

// 회원가입 응답
export interface UserResponse {
  id: number
  email: string
  nickname: string
  roles: ('ROLE_USER' | 'ROLE_ADMIN')[]
  streak?: number
  masteryRate?: number
}

// 로그인 요청
export interface SignInRequest {
  email: string
  password: string
}

// 로그인 응답
export interface SignInResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

// 비밀번호 재설정 요청
export interface PasswordResetRequest {
  email: string
}

// 비밀번호 재설정 검증 요청
export interface PasswordResetVerifyRequest {
  email: string
  code: string
  newPassword: string
}

// 이메일 인증 요청
export interface EmailVerificationRequest {
  email: string
}

// 이메일 인증 검증 요청
export interface EmailVerificationVerifyRequest {
  email: string
  code: string
}

// OAuth Provider
export type OAuthProvider = 'google' | 'kakao' | 'naver'
