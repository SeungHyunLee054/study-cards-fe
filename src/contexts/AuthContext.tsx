import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn as apiSignIn, signUp as apiSignUp, signOut as apiSignOut } from '@/api/auth'
import type { SignInRequest, SignUpRequest, UserResponse } from '@/types/auth'

interface AuthContextType {
  isLoggedIn: boolean
  isLoading: boolean
  login: (request: SignInRequest) => Promise<void>
  signup: (request: SignUpRequest) => Promise<UserResponse>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 초기 로그인 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    setIsLoggedIn(!!token)
    setIsLoading(false)
  }, [])

  // 강제 로그아웃 이벤트 리스너 (토큰 갱신 실패 시)
  useEffect(() => {
    const handleLogout = () => {
      setIsLoggedIn(false)
      navigate('/login')
    }

    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [navigate])

  const login = useCallback(async (request: SignInRequest) => {
    const response = await apiSignIn(request)
    localStorage.setItem('accessToken', response.accessToken)
    setIsLoggedIn(true)
  }, [])

  const signup = useCallback(async (request: SignUpRequest) => {
    return await apiSignUp(request)
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiSignOut()
    } catch {
      // 로그아웃 API 실패해도 로컬 토큰은 삭제
    }
    localStorage.removeItem('accessToken')
    setIsLoggedIn(false)
    navigate('/')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
