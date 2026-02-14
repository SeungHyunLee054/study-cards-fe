import axios from 'axios'
import { API_TIMEOUT_MS } from '@/lib/constants'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ''

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키(refreshToken) 포함
})

// 토큰 갱신 중복 요청 방지
let isRefreshing = false
let refreshSubscribers: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = []

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(token))
  refreshSubscribers = []
}

const onRefreshFailed = (err: unknown) => {
  refreshSubscribers.forEach(({ reject }) => reject(err))
  refreshSubscribers = []
}

const addRefreshSubscriber = (resolve: (token: string) => void, reject: (err: unknown) => void) => {
  refreshSubscribers.push({ resolve, reject })
}

// 요청 인터셉터: 토큰 자동 첨부
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 응답 인터셉터: 401 에러 시 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // refresh 요청 자체가 실패한 경우 로그아웃
      if (originalRequest.url === '/api/auth/refresh') {
        localStorage.removeItem('accessToken')
        window.dispatchEvent(new CustomEvent('auth:logout'))
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // 이미 갱신 중이면 대기
        return new Promise((resolve, reject) => {
          addRefreshSubscriber(
            (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            },
            (err: unknown) => {
              reject(err)
            }
          )
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // refresh는 만료된 access token 없이(refresh cookie 기반) 호출해야 한다.
        const response = await publicClient.post('/api/auth/refresh')
        const newToken = response.data.accessToken

        localStorage.setItem('accessToken', newToken)
        onRefreshed(newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        onRefreshFailed(refreshError)
        localStorage.removeItem('accessToken')
        window.dispatchEvent(new CustomEvent('auth:logout'))
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// 인증 불필요한 요청용 인스턴스
export const publicClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})
