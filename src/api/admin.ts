import { apiClient } from './client'
import { AxiosError } from 'axios'
import type { Category } from '@/types/card'
import type {
  AdminCardCreateRequest,
  AdminCardUpdateRequest,
  AdminCardResponse,
} from '@/types/admin'

export async function fetchAdminCards(category?: Category): Promise<AdminCardResponse[]> {
  try {
    const response = await apiClient.get<AdminCardResponse[]>('/api/admin/cards', {
      params: category ? { category } : undefined,
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
