import { apiClient, publicClient } from './client'
import { getOptionalAuthClient, withApiErrorHandling } from './helpers'
import type {
  CardResponse,
  StudyAnswerRequest,
  StudyResultResponse,
  StudyCardResponse,
  UserCardResponse,
  UserCardCreateRequest,
  UserCardUpdateRequest,
  PageResponse,
} from '@/types/card'

const LOGGED_IN_STUDY_PAGE_SIZE = 1000
const GUEST_STUDY_PAGE_SIZE = 15

// 학습할 카드 조회 (비로그인도 가능, 로그인 시 토큰 포함)
export async function fetchStudyCards(categoryCode?: string): Promise<CardResponse[]> {
  return withApiErrorHandling(async () => {
    const client = getOptionalAuthClient()
    const response = await client.get<PageResponse<CardResponse>>('/api/cards/study', {
      params: {
        ...(categoryCode && { category: categoryCode }),
        size: GUEST_STUDY_PAGE_SIZE,
      },
    })
    return response.data.content
  }, '학습 카드를 불러오는데 실패했습니다.', [429])
}

// 카드 개수 조회
export async function fetchCardCount(categoryCode?: string): Promise<number> {
  return withApiErrorHandling(async () => {
    const response = await publicClient.get<number>('/api/cards/count', {
      params: categoryCode ? { category: categoryCode } : undefined,
    })
    return response.data
  }, '카드 개수를 불러오는데 실패했습니다.')
}

// 단일 카드 조회
export async function fetchCard(id: number): Promise<CardResponse> {
  return withApiErrorHandling(async () => {
    const client = getOptionalAuthClient()
    const response = await client.get<CardResponse>(`/api/cards/${id}`)
    return response.data
  }, '카드를 불러오는데 실패했습니다.')
}

// 전체 카드 조회 (공용 + 내 카드, 인증 필수)
export async function fetchAllCards(categoryCode?: string): Promise<CardResponse[]> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<PageResponse<CardResponse>>('/api/cards/all', {
      params: {
        ...(categoryCode && { category: categoryCode }),
        size: 100,
      },
    })
    return response.data.content
  }, '전체 카드를 불러오는데 실패했습니다.')
}

// 전체 학습 카드 조회 (공용 + 내 카드, 인증 필수)
export async function fetchAllStudyCards(categoryCode?: string): Promise<CardResponse[]> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<PageResponse<CardResponse>>('/api/cards/study/all', {
      params: {
        ...(categoryCode && { category: categoryCode }),
        size: LOGGED_IN_STUDY_PAGE_SIZE,
      },
    })
    return response.data.content
  }, '전체 학습 카드를 불러오는데 실패했습니다.', [429])
}

// 오늘의 학습 카드 조회 (인증 필수)
export async function fetchTodayStudyCards(categoryCode?: string): Promise<StudyCardResponse[]> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<PageResponse<StudyCardResponse>>('/api/study/cards', {
      params: {
        ...(categoryCode && { category: categoryCode }),
        size: LOGGED_IN_STUDY_PAGE_SIZE,
      },
    })
    return response.data.content
  }, '오늘의 학습 카드를 불러오는데 실패했습니다.', [429])
}

// 학습 답변 제출
export async function submitStudyAnswer(request: StudyAnswerRequest): Promise<StudyResultResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.post<StudyResultResponse>('/api/study/answer', request)
    return response.data
  }, '답변 제출에 실패했습니다.')
}

// 사용자 카드 학습용 조회 (내 카드만 학습)
export async function fetchUserStudyCards(categoryCode?: string): Promise<UserCardResponse[]> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<PageResponse<UserCardResponse>>('/api/user/cards/study', {
      params: {
        ...(categoryCode && { category: categoryCode }),
        size: LOGGED_IN_STUDY_PAGE_SIZE,
      },
    })
    return response.data.content
  }, '내 학습 카드를 불러오는데 실패했습니다.', [429])
}

// 사용자 카드 목록 조회
export async function getUserCards(categoryCode?: string): Promise<UserCardResponse[]> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<PageResponse<UserCardResponse>>('/api/user/cards', {
      params: {
        ...(categoryCode && { category: categoryCode }),
        size: 100,
      },
    })
    return response.data.content
  }, '내 카드를 불러오는데 실패했습니다.')
}

// 단일 사용자 카드 조회
export async function getUserCard(id: number): Promise<UserCardResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<UserCardResponse>(`/api/user/cards/${id}`)
    return response.data
  }, '내 카드를 불러오는데 실패했습니다.')
}

// 사용자 카드 생성
export async function createUserCard(data: UserCardCreateRequest): Promise<UserCardResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.post<UserCardResponse>('/api/user/cards', data)
    return response.data
  }, '카드 생성에 실패했습니다.')
}

// 사용자 카드 수정
export async function updateUserCard(id: number, data: UserCardUpdateRequest): Promise<UserCardResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.put<UserCardResponse>(`/api/user/cards/${id}`, data)
    return response.data
  }, '카드 수정에 실패했습니다.')
}

// 사용자 카드 삭제
export async function deleteUserCard(id: number): Promise<void> {
  return withApiErrorHandling(async () => {
    await apiClient.delete(`/api/user/cards/${id}`)
  }, '카드 삭제에 실패했습니다.')
}
