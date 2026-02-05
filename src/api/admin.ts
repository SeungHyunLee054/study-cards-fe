import { apiClient } from './client'
import { AxiosError } from 'axios'
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
  pageParams?: PageParams
): Promise<PageResponse<AdminCardResponse>> {
  try {
    const response = await apiClient.get<PageResponse<AdminCardResponse>>('/api/admin/cards', {
      params: {
        ...(categoryCode && { category: categoryCode }),
        page: pageParams?.page ?? 0,
        size: pageParams?.size ?? 20,
      },
    })
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카드 목록을 불러오는데 실패했습니다.')
    }
    throw error
  }
}

export async function fetchAdminCard(id: number): Promise<AdminCardResponse> {
  try {
    const response = await apiClient.get<AdminCardResponse>(`/api/admin/cards/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카드를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

export async function createAdminCard(
  request: AdminCardCreateRequest
): Promise<AdminCardResponse> {
  try {
    const response = await apiClient.post<AdminCardResponse>('/api/admin/cards', request)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카드 생성에 실패했습니다.')
    }
    throw error
  }
}

export async function updateAdminCard(
  id: number,
  request: AdminCardUpdateRequest
): Promise<AdminCardResponse> {
  try {
    const response = await apiClient.put<AdminCardResponse>(`/api/admin/cards/${id}`, request)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카드 수정에 실패했습니다.')
    }
    throw error
  }
}

export async function deleteAdminCard(id: number): Promise<void> {
  try {
    await apiClient.delete(`/api/admin/cards/${id}`)
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카드 삭제에 실패했습니다.')
    }
    throw error
  }
}

// ============ 카테고리 관리 API ============

export async function createAdminCategory(
  request: CategoryCreateRequest
): Promise<CategoryResponse> {
  try {
    const response = await apiClient.post<CategoryResponse>('/api/admin/categories', request)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카테고리 생성에 실패했습니다.')
    }
    throw error
  }
}

export async function updateAdminCategory(
  id: number,
  request: CategoryUpdateRequest
): Promise<CategoryResponse> {
  try {
    const response = await apiClient.put<CategoryResponse>(`/api/admin/categories/${id}`, request)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카테고리 수정에 실패했습니다.')
    }
    throw error
  }
}

export async function deleteAdminCategory(id: number): Promise<void> {
  try {
    await apiClient.delete(`/api/admin/categories/${id}`)
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카테고리 삭제에 실패했습니다.')
    }
    throw error
  }
}
