import { AxiosError, type AxiosInstance } from 'axios'
import { apiClient, publicClient } from './client'

export interface ApiErrorPayload {
  message?: string
  code?: string
}

export function getOptionalAuthClient(): AxiosInstance {
  return localStorage.getItem('accessToken') ? apiClient : publicClient
}

export function toAppError(
  error: unknown,
  fallbackMessage: string,
  passthroughStatus: number[] = []
): never {
  if (error instanceof AxiosError) {
    const status = error.response?.status
    if (status !== undefined && passthroughStatus.includes(status)) {
      throw error
    }

    const payload = error.response?.data as ApiErrorPayload | undefined
    throw new Error(payload?.message || fallbackMessage)
  }

  throw error
}

export async function withApiErrorHandling<T>(
  fn: () => Promise<T>,
  fallbackMessage: string,
  passthroughStatus: number[] = []
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    return toAppError(error, fallbackMessage, passthroughStatus)
  }
}
