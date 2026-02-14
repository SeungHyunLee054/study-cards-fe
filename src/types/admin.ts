import type { CategoryResponse } from './category'

export interface AdminCardCreateRequest {
  question: string
  questionSub?: string
  answer: string
  answerSub?: string
  category: string
}

export interface AdminCardUpdateRequest {
  question: string
  questionSub?: string
  answer: string
  answerSub?: string
  category: string
}

export interface AdminCardResponse {
  id: number
  question: string
  questionSub: string | null
  answer: string
  answerSub: string | null
  efFactor: number
  category: CategoryResponse
  createdAt: string
}

export type AdminUserStatus = 'ACTIVE' | 'WITHDRAWN' | 'BANNED'
export type AdminUserRole = 'ROLE_USER' | 'ROLE_ADMIN'
export type AdminUserProvider = 'LOCAL' | 'GOOGLE' | 'KAKAO' | 'NAVER'

export interface AdminUserResponse {
  id: number
  email: string
  nickname: string
  roles: AdminUserRole[]
  provider: AdminUserProvider
  status: AdminUserStatus
  emailVerified: boolean
  createdAt: string
  modifiedAt: string | null
}
