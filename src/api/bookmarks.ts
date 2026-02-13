import { apiClient } from './client'
import { AxiosError } from 'axios'
import type { BookmarkResponse, BookmarkStatusResponse } from '@/types/bookmark'
import type { PageResponse } from '@/types/card'

// 공용 카드 북마크
export async function addCardBookmark(cardId: number): Promise<BookmarkResponse> {
  try {
    const response = await apiClient.post<BookmarkResponse>(`/api/bookmarks/cards/${cardId}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '북마크 추가에 실패했습니다.')
    }
    throw error
  }
}

// 공용 카드 북마크 해제
export async function removeCardBookmark(cardId: number): Promise<void> {
  try {
    await apiClient.delete(`/api/bookmarks/cards/${cardId}`)
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '북마크 해제에 실패했습니다.')
    }
    throw error
  }
}

// 사용자 카드 북마크
export async function addUserCardBookmark(userCardId: number): Promise<BookmarkResponse> {
  try {
    const response = await apiClient.post<BookmarkResponse>(`/api/bookmarks/user-cards/${userCardId}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '북마크 추가에 실패했습니다.')
    }
    throw error
  }
}

// 사용자 카드 북마크 해제
export async function removeUserCardBookmark(userCardId: number): Promise<void> {
  try {
    await apiClient.delete(`/api/bookmarks/user-cards/${userCardId}`)
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '북마크 해제에 실패했습니다.')
    }
    throw error
  }
}

// 북마크 목록 조회
export async function fetchBookmarks(params?: {
  category?: string
  page?: number
  size?: number
}): Promise<PageResponse<BookmarkResponse>> {
  try {
    const response = await apiClient.get<PageResponse<BookmarkResponse>>('/api/bookmarks', {
      params: {
        ...(params?.category && { category: params.category }),
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '북마크 목록을 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 공용 카드 북마크 상태 조회
export async function getCardBookmarkStatus(cardId: number): Promise<BookmarkStatusResponse> {
  try {
    const response = await apiClient.get<BookmarkStatusResponse>(`/api/bookmarks/cards/${cardId}/status`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '북마크 상태를 확인하는데 실패했습니다.')
    }
    throw error
  }
}

// 사용자 카드 북마크 상태 조회
export async function getUserCardBookmarkStatus(userCardId: number): Promise<BookmarkStatusResponse> {
  try {
    const response = await apiClient.get<BookmarkStatusResponse>(`/api/bookmarks/user-cards/${userCardId}/status`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '북마크 상태를 확인하는데 실패했습니다.')
    }
    throw error
  }
}
