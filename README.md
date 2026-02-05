# Study Cards Frontend

SM-2 알고리즘 기반 간격 반복 학습 플래시카드 서비스의 프론트엔드입니다.

> **Backend Repository**: [study-cards-be](https://github.com/SeungHyunLee054/study-cards-be)

## 주요 기능

- **간격 반복 학습**: SM-2 알고리즘 기반 복습 일정 자동 관리
- **플래시카드 관리**: 공용 카드 및 사용자 정의 카드 지원
- **학습 통계**: 진행률, 정답률, 연속 학습 추적
- **대시보드**: 오늘의 학습 현황 및 추천
- **구독 관리**: 토스페이먼츠 결제 연동
- **푸시 알림**: FCM 기반 일일 복습 알림
- **소셜 로그인**: Google, Kakao, Naver OAuth2

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
| `VITE_API_URL` | 백엔드 API URL | O |
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
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트
npm run lint
```

## 프로젝트 구조

```
src/
├── api/          # API 호출 함수
├── components/   # 재사용 컴포넌트
│   └── ui/       # 기본 UI 컴포넌트
├── contexts/     # React Context
├── hooks/        # 커스텀 훅
├── lib/          # 유틸리티
├── pages/        # 페이지 컴포넌트
├── types/        # TypeScript 타입
└── App.tsx       # 라우팅 설정
```

## 배포

### Vercel

1. Vercel에 프로젝트 연결
2. Settings > Environment Variables에서 환경 변수 설정
3. 자동 배포

> Vite는 빌드 시점에 환경 변수를 코드에 삽입합니다.
> `.env` 파일이 아닌 호스팅 플랫폼의 환경 변수 설정을 사용하세요.

## 라이선스

이 프로젝트는 [AGPL-3.0](LICENSE) 라이선스 하에 배포됩니다.
