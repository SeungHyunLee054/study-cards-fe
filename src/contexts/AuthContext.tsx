import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut } from '@/api/auth'
import { fetchUserProfile } from '@/api/users'
import { AuthContext } from '@/contexts/auth-context'
import type { SignInRequest, SignUpRequest, UserResponse } from '@/types/auth'
import type { UserProfileResponse } from '@/types/user'

export interface LogoutOptions {
  redirectTo?: string
  replace?: boolean
  state?: unknown
}

export interface AuthContextType {
  isLoggedIn: boolean
  isLoading: boolean
  user: UserProfileResponse | null
  isAdmin: boolean
  login: (request: SignInRequest) => Promise<void>
  signup: (request: SignUpRequest) => Promise<UserResponse>
  logout: (options?: LogoutOptions) => Promise<void>
  setLoggedIn: (value: boolean) => void
  refreshUser: () => Promise<void>
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserProfileResponse | null>(null)

  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false

  const refreshUser = useCallback(async () => {
    try {
      const profile = await fetchUserProfile()
      setUser(profile)
    } catch {
      setUser(null)
    }
  }, [])

  // 초기 로그인 상태 확인
  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('accessToken')
      if (token) {
        setIsLoggedIn(true)
        try {
          const profile = await fetchUserProfile()
          setUser(profile)
        } catch (err) {
          // 401(토큰 만료/무효)일 때만 로그아웃 처리
          // 서버 오류(500)나 네트워크 에러 시에는 로그인 상태 유지
          if (err instanceof AxiosError && err.response?.status === 401) {
            localStorage.removeItem('accessToken')
            setIsLoggedIn(false)
            setUser(null)
          }
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  // 강제 로그아웃 이벤트 리스너 (토큰 갱신 실패 시)
  useEffect(() => {
    const handleLogout = () => {
      setIsLoggedIn(false)
      setUser(null)
      navigate('/login')
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [navigate])

  // 크로스 탭 인증 동기화
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        if (e.newValue) {
          setIsLoggedIn(true)
          refreshUser()
        } else {
          setIsLoggedIn(false)
          setUser(null)
          navigate('/login')
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [navigate, refreshUser])

  const login = useCallback(async (request: SignInRequest) => {
    const response = await apiSignIn(request)
    localStorage.setItem('accessToken', response.accessToken)
    setIsLoggedIn(true)
    // 로그인 후 사용자 정보 로드
    try {
      const profile = await fetchUserProfile()
      setUser(profile)
    } catch {
      // 사용자 정보 로드 실패해도 로그인은 유지
    }
  }, [])

  const signup = useCallback(async (request: SignUpRequest) => {
    return await apiSignUp(request)
  }, [])

  const logout = useCallback(async (options?: LogoutOptions) => {
    try {
      await apiSignOut()
    } catch {
      // 로그아웃 API 실패해도 로컬 토큰은 삭제
    }
    localStorage.removeItem('accessToken')
    setIsLoggedIn(false)
    setUser(null)
    navigate(options?.redirectTo ?? '/', {
      replace: options?.replace ?? false,
      state: options?.state,
    })
  }, [navigate])

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        isAdmin,
        login,
        signup,
        logout,
        setLoggedIn: setIsLoggedIn,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
