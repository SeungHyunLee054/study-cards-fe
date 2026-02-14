import { AxiosError } from 'axios'
import { apiClient } from './client'
import { withApiErrorHandling } from './helpers'
import type {
  GenerateUserCardRequest,
  UserAiGenerationResponse,
  AiLimitResponse,
} from '@/types/ai'

export async function generateUserCards(request: GenerateUserCardRequest): Promise<UserAiGenerationResponse> {
  try {
    return await withApiErrorHandling(async () => {
      const response = await apiClient.post<UserAiGenerationResponse>('/api/ai/generate-cards', request)
      return response.data
    }, 'AI 카드 생성에 실패했습니다.', [429])
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 429) {
      throw new Error('AI 생성 한도를 초과했습니다. 내일 다시 시도해주세요.')
    }
    throw error
  }
}

export async function fetchAiGenerationLimit(): Promise<AiLimitResponse> {
  return withApiErrorHandling(async () => {
    const response = await apiClient.get<AiLimitResponse>('/api/ai/generation-limit')
    return response.data
  }, 'AI 생성 한도를 확인하는데 실패했습니다.')
}
