# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 빌드 및 실행

```bash
# 개발 서버 실행 (port 3000)
npm run dev

# 프로젝트 빌드 (TypeScript 체크 + Vite 빌드)
npm run build

# 프로덕션 빌드 미리보기
npm run preview

# 린트 실행
npm run lint
```

---

## 기술 스택

- React 19
- Vite
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Axios
- React Router DOM

---

## 프로젝트 구조

```
src/
├── api/                    # API 레이어
│   ├── client.ts           # Axios 인스턴스 (인터셉터 포함)
│   ├── auth.ts             # 인증 API
│   └── cards.ts            # 카드 API
│
├── contexts/               # React Context
│   └── AuthContext.tsx     # 전역 인증 상태
│
├── pages/                  # 페이지 컴포넌트
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx
│   ├── MyPage.tsx
│   └── StudyPage.tsx
│
├── components/             # 컴포넌트
│   ├── ui/                 # Shadcn/UI 스타일 기본 컴포넌트
│   ├── CardDeck.tsx
│   └── DifficultyGauge.tsx
│
├── hooks/                  # 커스텀 훅
├── types/                  # TypeScript 타입 정의
├── lib/                    # 유틸리티
└── App.tsx                 # 라우팅 설정
```

---

## 경로 별칭

`@/`는 `./src/`를 가리킴 (vite.config.ts, tsconfig.json에 설정)

```typescript
import { Button } from '@/components/ui/button'
```

---

## API 레이어

**client.ts**
- `apiClient`: 인증 필요한 요청용 (토큰 자동 첨부, 401 시 자동 갱신)
- `publicClient`: 인증 불필요한 요청용

**토큰 관리**
- Access Token: `localStorage.accessToken`
- Refresh Token: httpOnly 쿠키 (백엔드 관리)
- 401 응답 시 자동으로 토큰 갱신 후 재요청
- 갱신 실패 시 `auth:logout` 이벤트 발생 → 로그인 페이지로 이동

---

## 인증 시스템

`AuthContext`에서 전역 인증 상태 관리

```typescript
const { isLoggedIn, isLoading, login, logout, signup } = useAuth()
```

---

## 백엔드 연동

백엔드: Spring Boot (`http://localhost:8080`, `VITE_API_URL` 환경변수로 변경 가능)

API 엔드포인트:
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/signin` - 로그인
- `POST /api/auth/signout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신

---

## Git 커밋 규칙

### 커밋 메시지 구조

```
Type: Subject

Body
```

### Type

| Type | 설명 |
|------|------|
| Feat | 새로운 기능 추가 |
| Fix | 버그 수정 |
| Docs | 문서 수정 |
| Style | 코드 포맷팅, 세미콜론 누락 등 (코드 변경 없음) |
| Refactor | 코드 리팩토링 |
| Test | 테스트 코드 추가/수정 |
| Chore | 빌드, 패키지 매니저 설정 등 |
| Design | UI/UX 디자인 변경 |
| Comment | 주석 추가/수정 |
| Rename | 파일/폴더명 수정 또는 이동 |
| Remove | 파일 삭제 |

### Subject (제목)

- 50글자 이내
- 첫 문자는 대문자
- 끝에 마침표 및 특수문자 사용 금지
- 콜론 뒤에만 스페이스 사용

```
// bad
feat : 로그인 기능 추가.

// good
Feat: 로그인 기능 추가
```

### Body (본문)

- 한 줄 당 72자 이내
- **무엇을**, **왜** 변경했는지 설명 (어떻게 X)
- 상세히 작성

### 기타 규칙

- 커밋 메시지에 `Co-Authored-By` 추가 금지
- 기능 단위로 커밋 분리
