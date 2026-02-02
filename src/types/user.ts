export interface UserProfileResponse {
  id: number
  email: string
  nickname: string
  roles: ('ROLE_USER' | 'ROLE_ADMIN')[]
  streak?: number
  masteryRate?: number
}

export interface UserProfileUpdateRequest {
  nickname?: string
  email?: string
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}
