import { apiClient, publicClient } from './client'
import { AxiosError } from 'axios'
import type { CategoryResponse, CategoryTreeResponse } from '@/types/category'
import type { PageResponse } from '@/types/card'

// 전체 카테고리 목록 조회
export async function fetchCategories(): Promise<CategoryResponse[]> {
  try {
    // 로그인 상태면 apiClient 사용 (인증 필요한 경우 대응)
    const client = localStorage.getItem('accessToken') ? apiClient : publicClient
    const response = await client.get<PageResponse<CategoryResponse>>('/api/categories', {
      params: { size: 100 }, // 카테고리는 보통 많지 않으므로 한 번에 가져옴
    })
    return response.data.content
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카테고리를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 카테고리 트리 조회
export async function fetchCategoryTree(): Promise<CategoryTreeResponse[]> {
  try {
    const client = localStorage.getItem('accessToken') ? apiClient : publicClient
    const response = await client.get<CategoryTreeResponse[]>('/api/categories/tree')
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카테고리 트리를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 단일 카테고리 조회
export async function fetchCategory(code: string): Promise<CategoryResponse> {
  try {
    const client = localStorage.getItem('accessToken') ? apiClient : publicClient
    const response = await client.get<CategoryResponse>(`/api/categories/${code}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '카테고리를 불러오는데 실패했습니다.')
    }
    throw error
  }
}

// 자식 카테고리 조회
export async function fetchChildCategories(code: string): Promise<CategoryResponse[]> {
  try {
    const client = localStorage.getItem('accessToken') ? apiClient : publicClient
    const response = await client.get<PageResponse<CategoryResponse>>(`/api/categories/${code}/children`, {
      params: { size: 100 },
    })
    return response.data.content
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || '자식 카테고리를 불러오는데 실패했습니다.')
    }
    throw error
  }
}
