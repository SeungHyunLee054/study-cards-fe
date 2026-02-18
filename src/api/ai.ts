import { AxiosError } from 'axios'
import { apiClient } from './client'
import { withApiErrorHandling } from './helpers'
import type {
  GenerateUserCardRequest,
  GenerateUserCardsByUploadRequest,
  UserAiGenerationResponse,
  AiLimitResponse,
} from '@/types/ai'

function handleAiGenerateError(error: unknown): never {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const payload = error.response?.data as { message?: string } | undefined

    if (status === 429) {
      throw new Error('AI 생성 한도를 초과했습니다. 내일 다시 시도해주세요.')
    }

    if (status === 400 && payload?.message) {
      throw new Error(payload.message)
    }
  }

  throw error
}

export async function generateUserCards(request: GenerateUserCardRequest): Promise<UserAiGenerationResponse> {
  try {
    return await withApiErrorHandling(async () => {
      const response = await apiClient.post<UserAiGenerationResponse>('/api/ai/generate-cards', request)
      return response.data
    }, 'AI 카드 생성에 실패했습니다.', [400, 429])
  } catch (error) {
    return handleAiGenerateError(error)
  }
}

export async function generateUserCardsByUpload(
  request: GenerateUserCardsByUploadRequest
): Promise<UserAiGenerationResponse> {
  const formData = new FormData()
  formData.append('file', request.file)
  formData.append('categoryCode', request.categoryCode)
  if (request.count !== undefined) {
    formData.append('count', String(request.count))
  }
  if (request.difficulty) {
    formData.append('difficulty', request.difficulty)
  }

  try {
    return await withApiErrorHandling(async () => {
      const response = await apiClient.post<UserAiGenerationResponse>(
        '/api/ai/generate-cards/upload',
        formData
      )
      return response.data
    }, 'AI 파일 카드 생성에 실패했습니다.', [400, 429])
  } catch (error) {
    return handleAiGenerateError(error)
  }
}

export async function fetchAiGenerationLimit(): Promise<AiLimitResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<AiLimitResponse>('/api/ai/generation-limit')
    return response.data
  }, 'AI 생성 한도를 확인하는데 실패했습니다.')
}
