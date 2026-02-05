// 카테고리 응답 (백엔드 CategoryResponse 기준)
export interface CategoryResponse {
  id: number
  code: string
  name: string
  parentId: number | null
  parentCode: string | null
}

// 카테고리 트리 응답 (백엔드 CategoryTreeResponse 기준)
export interface CategoryTreeResponse {
  id: number
  code: string
  name: string
  depth: number
  displayOrder: number
  children: CategoryTreeResponse[]
}

// 카테고리 생성 요청
export interface CategoryCreateRequest {
  code: string
  name: string
  parentCode?: string
  displayOrder?: number
}

// 카테고리 수정 요청
export interface CategoryUpdateRequest {
  code: string
  name: string
  displayOrder?: number
}
