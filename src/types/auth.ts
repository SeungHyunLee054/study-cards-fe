// 회원가입 요청
export interface SignUpRequest {
  email: string
  password: string
  nickname: string
}

// 회원가입 응답
export interface UserResponse {
  id: number
  email: string
  nickname: string
  streak: number
  masteryRate: number
}

// 로그인 요청
export interface SignInRequest {
  email: string
  password: string
}

// 로그인 응답
export interface SignInResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}
