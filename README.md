# Study Cards Frontend

SM-2 알고리즘 기반 간격 반복 학습 플래시카드 서비스의 프론트엔드입니다.

> **Backend Repository**: [study-cards-be](https://github.com/SeungHyunLee054/study-cards-be)

## 주요 기능

- **간격 반복 학습**: SM-2 알고리즘 기반 복습 일정 자동 관리
- **플래시카드 관리**: 공용 카드 및 사용자 정의 카드 지원
- **AI 카드 생성**: 텍스트 입력으로 플래시카드 자동 생성 (사용자용 + 관리자용)
- **AI 학습 추천**: 우선순위 기반 맞춤 카드 추천 및 카테고리별 정답률 분석
- **카드 검색**: 키워드 및 카테고리 기반 카드 검색
- **카드 북마크**: 학습 중 카드 북마크 및 북마크 목록 관리
- **학습 통계**: 진행률, 정답률, 연속 학습 추적
- **학습 세션 이력**: 과거 학습 세션 조회 및 복습
- **대시보드**: 오늘의 학습 현황 및 추천
- **구독 관리**: 토스페이먼츠 결제 연동
- **푸시 알림**: FCM 기반 일일 복습 알림
- **소셜 로그인**: Google, Kakao, Naver OAuth2
- **이메일 인증**: 회원가입 시 이메일 인증 지원
- **비밀번호 재설정**: 이메일 기반 비밀번호 복구
- **반응형 UI**: PC 웹 및 모바일 웹 대응

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React 19 |
| Build Tool | Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Shadcn/UI |
| HTTP Client | Axios |
| Routing | React Router DOM |
| Push Notification | Firebase Cloud Messaging |
| Payment | Toss Payments |

## 환경 설정

### 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치

```bash
git clone https://github.com/SeungHyunLee054/study-cards-fe.git
cd study-cards-fe
npm install
```

### 환경 변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `VITE_API_URL` | 백엔드 API URL (미설정 시 상대 경로 사용) | X |
| `VITE_TOSS_CLIENT_KEY` | 토스페이먼츠 클라이언트 키 | X |
| `VITE_FIREBASE_API_KEY` | Firebase API 키 | X |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth 도메인 | X |
| `VITE_FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | X |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage 버킷 | X |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID | X |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | X |
| `VITE_FIREBASE_VAPID_KEY` | FCM VAPID 키 | X |

### 실행

```bash
# 개발 서버 (port 3000)
npm run dev

# 프로덕션 빌드
# (firebase-messaging-sw.js 생성 + TypeScript 체크 + Vite 빌드)
npm run build

# 빌드 미리보기
npm run preview

# 린트
npm run lint
```

## 프로젝트 구조

```
src/
├── api/                        # API 호출 함수
│   ├── client.ts               # Axios 인스턴스 (인터셉터, 토큰 자동 갱신)
│   ├── auth.ts                 # 인증 (로그인/회원가입/OAuth)
│   ├── cards.ts                # 카드/학습 API
│   ├── categories.ts           # 카테고리 API
│   ├── bookmarks.ts            # 북마크 API
│   ├── search.ts               # 카드 검색 API
│   ├── recommendations.ts      # 학습 추천 API
│   ├── ai.ts                   # 사용자 AI 카드 생성 API
│   ├── subscriptions.ts        # 구독/결제 API
│   ├── notifications.ts        # 푸시 알림 API
│   ├── dashboard.ts            # 대시보드 API
│   ├── sessions.ts             # 학습 세션 API
│   ├── stats.ts                # 통계 API
│   ├── users.ts                # 사용자 프로필 API
│   ├── admin-users.ts          # 관리자 사용자 API
│   ├── generation.ts           # 관리자 AI 생성 API
│   ├── admin.ts                # 관리자 카드/카테고리 API
│   └── helpers.ts              # 공통 에러 핸들링 유틸
│
├── components/                 # 재사용 컴포넌트
│   ├── ui/                     # Shadcn/UI 기본 컴포넌트
│   ├── CardDeck.tsx            # 카드 학습 인터페이스
│   ├── BookmarkButton.tsx      # 북마크 토글 버튼
│   ├── CategoryFilterTree.tsx  # 카테고리 필터 트리
│   ├── CategoryProgressTree.tsx # 카테고리 진행률 트리
│   ├── RecommendedCardList.tsx # 추천 카드 리스트
│   ├── CategoryAccuracyChart.tsx # 카테고리 정답률 차트
│   ├── PriorityBadge.tsx       # 우선순위 뱃지
│   ├── NotificationDropdown.tsx # 알림 드롭다운
│   ├── GenerationForm.tsx      # AI 생성 폼
│   ├── GeneratedCardItem.tsx   # 생성된 카드 항목
│   ├── ProtectedRoute.tsx      # 인증 라우트 가드
│   ├── AdminRoute.tsx          # 관리자 라우트 가드
│   ├── ErrorBoundary.tsx       # 에러 바운더리
│   └── ...
│
├── contexts/
│   └── AuthContext.tsx          # 전역 인증 상태 관리
│
├── hooks/                      # 커스텀 훅
│   ├── useStudyCards.ts        # 학습 카드 상태 관리
│   ├── useBookmark.ts          # 북마크 상태 관리
│   ├── useDebounce.ts          # 디바운스 훅
│   ├── useInfiniteGeneratedCards.ts # 무한 스크롤 (생성 카드)
│   └── useInfiniteAdminCards.ts    # 무한 스크롤 (관리자 카드)
│
├── lib/                        # 유틸리티
│   ├── firebase.ts             # FCM 푸시 알림 설정
│   ├── tosspayments.ts         # 토스페이먼츠 결제 연동
│   ├── categoryTreeUtils.ts    # 카테고리 트리 유틸
│   ├── constants.ts            # 상수 정의
│   └── utils.ts                # 공통 유틸
│
├── pages/                      # 페이지 컴포넌트 (25개)
├── types/                      # TypeScript 타입 정의 (15개)
└── App.tsx                     # 라우팅 설정 (코드 스플리팅)
```

## 인증 및 토큰 갱신 흐름

- Access Token은 `localStorage.accessToken`에 저장됩니다.
- Refresh Token은 httpOnly 쿠키로 관리됩니다.
- 인증 요청은 `apiClient`를 사용하며, `Authorization: Bearer <accessToken>`이 자동으로 첨부됩니다.
- API 요청이 `401`이면 `/api/auth/refresh`로 재발급을 시도합니다.
- 재발급 요청은 `publicClient`로 호출되어 만료된 access token 헤더가 붙지 않습니다.
- 재발급 성공 시 새 access token 저장 후 원래 요청을 자동 재시도합니다.
- 재발급 실패 시 `auth:logout` 이벤트를 발생시켜 로그인 페이지로 이동합니다.

## 페이지 라우트

### 공개 라우트

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | HomePage | 랜딩 페이지 |
| `/about` | AboutPage | 서비스 소개 |
| `/login` | LoginPage | 로그인 |
| `/signup` | SignupPage | 회원가입 |
| `/forgot-password` | ForgotPasswordPage | 비밀번호 재설정 |
| `/verify-email` | EmailVerificationPage | 이메일 인증 |
| `/oauth2/callback` | OAuthCallbackPage | OAuth 콜백 |
| `/study` | StudyPage | 학습 (비로그인 시 공용 카드만) |
| `/search` | SearchPage | 카드 검색 |
| `/subscription` | SubscriptionPage | 구독/요금제 |
| `/subscription/success` | SubscriptionSuccessPage | 결제 성공 |
| `/subscription/fail` | SubscriptionFailPage | 결제 실패 |
| `/privacy` | PrivacyPage | 개인정보처리방침 |
| `/terms` | TermsPage | 이용약관 |

### 로그인 필수 라우트

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/dashboard` | DashboardPage | 대시보드 |
| `/mypage` | MyPage | 마이페이지 |
| `/my-cards` | MyCardsPage | 내 카드 관리 |
| `/bookmarks` | BookmarksPage | 북마크 목록 |
| `/ai-generate` | AiGeneratePage | AI 카드 생성 |
| `/stats` | StatsPage | 학습 통계 |
| `/sessions` | SessionHistoryPage | 세션 이력 |
| `/mypage#settings` | MyPage | 설정 섹션으로 바로 이동 |

### 관리자 전용 라우트

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/admin/cards` | AdminCardsPage | 카드/카테고리 관리 |
| `/admin/users` | AdminUsersPage | 사용자 관리 |
| `/admin/generation` | AdminGenerationPage | AI 생성 관리 |

## 배포

### Vercel

1. Vercel에 프로젝트 연결
2. Settings > Environment Variables에서 `VITE_*` 환경 변수 설정
3. 자동 배포

> `vercel.json` rewrites 기준:
> - `/api/:path*` -> `https://api.studycard.kr/api/:path*`
> - `/oauth2/authorization/:path*` -> `https://api.studycard.kr/oauth2/authorization/:path*`
> - 그 외 경로 -> `/index.html` (SPA fallback)

> Vite는 빌드 시점에 환경 변수를 코드에 삽입합니다.
> `.env` 파일이 아닌 호스팅 플랫폼의 환경 변수 설정을 사용하세요.

## 라이선스

이 프로젝트는 [AGPL-3.0](LICENSE) 라이선스 하에 배포됩니다.
