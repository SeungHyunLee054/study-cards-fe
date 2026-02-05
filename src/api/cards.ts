import { apiClient, publicClient } from './client'
import { AxiosError } from 'axios'
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

// 학습할 카드 조회 (비로그인도 가능, 로그인 시 토큰 포함)
export async function fetchStudyCards(categoryCode?: string): Promise<CardResponse[]> {
  try {
    // 로그인 상태면 apiClient 사용 (rate limit 우회)
    const client = localStorage.getItem('accessToken') ? apiClient : publicClient
    const response = await client.get<PageResponse<CardResponse>>('/api/cards/study', {
      params: {
        ...(categoryCode && { category: categoryCode }),
        size: 100,
      },
    })
    return response.data.content
  } catch (error) {
    if (error instanceof AxiosError) {
      // 429 에러는 그대로 전달 (Rate Limit 처리용)
      if (error.response?.status === 429) {
        throw error
      }
      throw new Error(error.response?.data?.message || '학습 카드를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 카드 개수 조회
export async function fetchCardCount(categoryCode?: string): Promise<number> {
  try {
    const response = await publicClient.get<number>('/api/cards/count', {
      params: categoryCode ? { category: categoryCode } : undefined,
    })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카드 개수를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 단일 카드 조회
export async function fetchCard(id: number): Promise<CardResponse> {
  try {
    const client = localStorage.getItem('accessToken') ? apiClient : publicClient
    const response = await client.get<CardResponse>(`/api/cards/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카드를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 전체 카드 조회 (공용 + 내 카드, 인증 필수)
export async function fetchAllCards(categoryCode?: string): Promise<CardResponse[]> {
  try {
    const response = await apiClient.get<PageResponse<CardResponse>>('/api/cards/all', {
      params: {
        ...(categoryCode && { category: categoryCode }),
        size: 100,
      },
    })
    return response.data.content
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '전체 카드를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 전체 학습 카드 조회 (공용 + 내 카드, 인증 필수)
export async function fetchAllStudyCards(categoryCode?: string): Promise<CardResponse[]> {
  try {
    const response = await apiClient.get<PageResponse<CardResponse>>('/api/cards/study/all', {
      params: {
        ...(categoryCode && { category: categoryCode }),
        size: 100,
      },
    })
    return response.data.content
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 429) {
        throw error
      }
      throw new Error(error.response?.data?.message || '전체 학습 카드를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 오늘의 학습 카드 조회 (인증 필수)
export async function fetchTodayStudyCards(categoryCode?: string): Promise<StudyCardResponse[]> {
  try {
    const response = await apiClient.get<PageResponse<StudyCardResponse>>('/api/study/cards', {
      params: {
        ...(categoryCode && { category: categoryCode }),
        size: 100,
      },
    })
    return response.data.content
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 429) {
        throw error
      }
      throw new Error(error.response?.data?.message || '오늘의 학습 카드를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 학습 답변 제출
export async function submitStudyAnswer(request: StudyAnswerRequest): Promise<StudyResultResponse> {
  try {
    const response = await apiClient.post<StudyResultResponse>('/api/study/answer', request)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '답변 제출에 실패했습니다.')
    }
    throw error
  }
}

// 사용자 카드 학습용 조회 (내 카드만 학습)
export async function fetchUserStudyCards(categoryCode?: string): Promise<UserCardResponse[]> {
  try {
    const response = await apiClient.get<PageResponse<UserCardResponse>>('/api/user/cards/study', {
      params: {
        ...(categoryCode && { category: categoryCode }),
        size: 100,
      },
    })
    return response.data.content
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 429) {
        throw error
      }
      throw new Error(error.response?.data?.message || '내 학습 카드를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 사용자 카드 목록 조회
export async function getUserCards(categoryCode?: string): Promise<UserCardResponse[]> {
  try {
    const response = await apiClient.get<PageResponse<UserCardResponse>>('/api/user/cards', {
      params: {
        ...(categoryCode && { category: categoryCode }),
        size: 100,
      },
    })
    return response.data.content
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '내 카드를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 단일 사용자 카드 조회
export async function getUserCard(id: number): Promise<UserCardResponse> {
  try {
    const response = await apiClient.get<UserCardResponse>(`/api/user/cards/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '내 카드를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 사용자 카드 생성
export async function createUserCard(data: UserCardCreateRequest): Promise<UserCardResponse> {
  try {
    const response = await apiClient.post<UserCardResponse>('/api/user/cards', data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카드 생성에 실패했습니다.')
    }
    throw error
  }
}

// 사용자 카드 수정
export async function updateUserCard(id: number, data: UserCardUpdateRequest): Promise<UserCardResponse> {
  try {
    const response = await apiClient.put<UserCardResponse>(`/api/user/cards/${id}`, data)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카드 수정에 실패했습니다.')
    }
    throw error
  }
}

// 사용자 카드 삭제
export async function deleteUserCard(id: number): Promise<void> {
  try {
    await apiClient.delete(`/api/user/cards/${id}`)
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카드 삭제에 실패했습니다.')
    }
    throw error
  }
}
