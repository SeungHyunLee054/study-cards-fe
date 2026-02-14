import { apiClient } from './client'
import { withApiErrorHandling } from './helpers'
import type { BookmarkResponse, BookmarkStatusResponse } from '@/types/bookmark'
import type { PageResponse } from '@/types/card'

// 공용 카드 북마크
export async function addCardBookmark(cardId: number): Promise<BookmarkResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.post<BookmarkResponse>(`/api/bookmarks/cards/${cardId}`)
    return response.data
  }, '북마크 추가에 실패했습니다.')
}

// 공용 카드 북마크 해제
export async function removeCardBookmark(cardId: number): Promise<void> {
  return withApiErrorHandling(async () => {
    await apiClient.delete(`/api/bookmarks/cards/${cardId}`)
  }, '북마크 해제에 실패했습니다.')
}

// 사용자 카드 북마크
export async function addUserCardBookmark(userCardId: number): Promise<BookmarkResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.post<BookmarkResponse>(`/api/bookmarks/user-cards/${userCardId}`)
    return response.data
  }, '북마크 추가에 실패했습니다.')
}

// 사용자 카드 북마크 해제
export async function removeUserCardBookmark(userCardId: number): Promise<void> {
  return withApiErrorHandling(async () => {
    await apiClient.delete(`/api/bookmarks/user-cards/${userCardId}`)
  }, '북마크 해제에 실패했습니다.')
}

// 북마크 목록 조회
export async function fetchBookmarks(params?: {
  category?: string
  page?: number
  size?: number
}): Promise<PageResponse<BookmarkResponse>> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<PageResponse<BookmarkResponse>>('/api/bookmarks', {
      params: {
        ...(params?.category && { category: params.category }),
        page: params?.page ?? 0,
        size: params?.size ?? 20,
      },
    })
    return response.data
  }, '북마크 목록을 불러오는데 실패했습니다.')
}

// 공용 카드 북마크 상태 조회
export async function getCardBookmarkStatus(cardId: number): Promise<BookmarkStatusResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<BookmarkStatusResponse>(`/api/bookmarks/cards/${cardId}/status`)
    return response.data
  }, '북마크 상태를 확인하는데 실패했습니다.')
}

// 사용자 카드 북마크 상태 조회
export async function getUserCardBookmarkStatus(userCardId: number): Promise<BookmarkStatusResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<BookmarkStatusResponse>(`/api/bookmarks/user-cards/${userCardId}/status`)
    return response.data
  }, '북마크 상태를 확인하는데 실패했습니다.')
}
