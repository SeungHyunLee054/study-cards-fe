import { apiClient } from './client'
import { withApiErrorHandling } from './helpers'
import type {
  AdminCardCreateRequest,
  AdminCardUpdateRequest,
  AdminCardResponse,
} from '@/types/admin'
import type {
  CategoryResponse,
  CategoryCreateRequest,
  CategoryUpdateRequest,
} from '@/types/category'
import type { PageResponse } from '@/types/card'

export interface PageParams {
  page?: number
  size?: number
}

export async function fetchAdminCards(
  categoryCode?: string,
  pageParams?: PageParams,
  keyword?: string
): Promise<PageResponse<AdminCardResponse>> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<PageResponse<AdminCardResponse>>('/api/admin/cards', {
      params: {
        ...(categoryCode && { category: categoryCode }),
        ...(keyword && { keyword }),
        page: pageParams?.page ?? 0,
        size: pageParams?.size ?? 20,
      },
    })
    return response.data
  }, '카드 목록을 불러오는데 실패했습니다.')
}

export async function fetchAdminCard(id: number): Promise<AdminCardResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<AdminCardResponse>(`/api/admin/cards/${id}`)
    return response.data
  }, '카드를 불러오는데 실패했습니다.')
}

export async function createAdminCard(
  request: AdminCardCreateRequest
): Promise<AdminCardResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.post<AdminCardResponse>('/api/admin/cards', request)
    return response.data
  }, '카드 생성에 실패했습니다.')
}

export async function updateAdminCard(
  id: number,
  request: AdminCardUpdateRequest
): Promise<AdminCardResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.put<AdminCardResponse>(`/api/admin/cards/${id}`, request)
    return response.data
  }, '카드 수정에 실패했습니다.')
}

export async function deleteAdminCard(id: number): Promise<void> {
  return withApiErrorHandling(async () => {
    await apiClient.delete(`/api/admin/cards/${id}`)
  }, '카드 삭제에 실패했습니다.')
}

// ============ 카테고리 관리 API ============

export async function createAdminCategory(
  request: CategoryCreateRequest
): Promise<CategoryResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.post<CategoryResponse>('/api/admin/categories', request)
    return response.data
  }, '카테고리 생성에 실패했습니다.')
}

export async function updateAdminCategory(
  id: number,
  request: CategoryUpdateRequest
): Promise<CategoryResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.put<CategoryResponse>(`/api/admin/categories/${id}`, request)
    return response.data
  }, '카테고리 수정에 실패했습니다.')
}

export async function deleteAdminCategory(id: number): Promise<void> {
  return withApiErrorHandling(async () => {
    await apiClient.delete(`/api/admin/categories/${id}`)
  }, '카테고리 삭제에 실패했습니다.')
}
