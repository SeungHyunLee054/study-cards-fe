import { withApiErrorHandling, getOptionalAuthClient } from './helpers'
import type { CategoryResponse, CategoryTreeResponse } from '@/types/category'
import type { PageResponse } from '@/types/card'

// 전체 카테고리 목록 조회
export async function fetchCategories(): Promise<CategoryResponse[]> {
  return withApiErrorHandling(async () => {
    const client = getOptionalAuthClient()
    const response = await client.get<PageResponse<CategoryResponse>>('/api/categories', {
      params: { size: 100 },
    })
    return response.data.content
  }, '카테고리를 불러오는데 실패했습니다.')
}

// 카테고리 트리 조회
export async function fetchCategoryTree(): Promise<CategoryTreeResponse[]> {
  return withApiErrorHandling(async () => {
    const client = getOptionalAuthClient()
    const response = await client.get<CategoryTreeResponse[]>('/api/categories/tree')
    return response.data
  }, '카테고리 트리를 불러오는데 실패했습니다.')
}

// 단일 카테고리 조회
export async function fetchCategory(code: string): Promise<CategoryResponse> {
  return withApiErrorHandling(async () => {
    const client = getOptionalAuthClient()
    const response = await client.get<CategoryResponse>(`/api/categories/${code}`)
    return response.data
  }, '카테고리를 불러오는데 실패했습니다.')
}

// 자식 카테고리 조회
export async function fetchChildCategories(code: string): Promise<CategoryResponse[]> {
  return withApiErrorHandling(async () => {
    const client = getOptionalAuthClient()
    const response = await client.get<PageResponse<CategoryResponse>>(`/api/categories/${code}/children`, {
      params: { size: 100 },
    })
    return response.data.content
  }, '자식 카테고리를 불러오는데 실패했습니다.')
}
