export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'KAKAO' | 'NAVER'

export interface UserProfileResponse {
  id: number
  email: string
  nickname: string
  roles: ('ROLE_USER' | 'ROLE_ADMIN')[]
  provider?: AuthProvider
  streak?: number
  masteryRate?: number
}

export interface UserProfileUpdateRequest {
  nickname: string
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}
