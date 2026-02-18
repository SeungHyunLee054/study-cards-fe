import { useEffect, useState, useRef, useCallback } from 'react'
import { AxiosError } from 'axios'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, User, CalendarCheck, BookOpen, Sparkles, AlertTriangle, Crown, History, CheckCircle2, XCircle } from 'lucide-react'
import { CardDeck } from '@/components/CardDeck'
import { RateLimitModal } from '@/components/RateLimitModal'
import { RecommendedCardList } from '@/components/RecommendedCardList'
import { CategoryAccuracyChart } from '@/components/CategoryAccuracyChart'
import { CategoryFilterSection } from '@/components/CategoryFilterSection'
import { useStudyCards } from '@/hooks/useStudyCards'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/AppHeader'
import { useAuth } from '@/contexts/useAuth'
import { useCategories } from '@/hooks/useCategories'
import { fetchAiRecommendations, fetchAiRecommendationHistory, fetchCategoryAccuracy } from '@/api/recommendations'
import { fetchMySubscription } from '@/api/subscriptions'
import { DASHBOARD_PATH } from '@/constants/routes'
import type {
  AiRecommendationResponse,
  AiRecommendationHistoryResponse,
  AiRecommendationWeakConcept,
  CategoryAccuracyResponse,
} from '@/types/recommendation'
import { STUDY_LOAD_DEBOUNCE_MS } from '@/lib/constants'

type StudyMode = 'all' | 'review' | 'myCards' | 'session-review' | 'recommended'

interface StudyPageProps {
  forcedMode?: StudyMode
  hideModeSelector?: boolean
}

const AI_REVIEW_ELIGIBILITY_CACHE_TTL_MS = 30_000
const AI_REVIEW_DATA_CACHE_TTL_MS = 30_000
const AI_REVIEW_HISTORY_CACHE_TTL_MS = 30_000
const AI_REVIEW_HISTORY_PAGE_SIZE = 5

type AiReviewData = {
  recommendations: AiRecommendationResponse
  categoryAccuracy: CategoryAccuracyResponse[]
}

const aiReviewEligibilityCache = new Map<string, { value: boolean; expiresAt: number }>()
const aiReviewEligibilityInFlight = new Map<string, Promise<boolean>>()
const aiReviewDataCache = new Map<string, { value: AiReviewData; expiresAt: number }>()
const aiReviewDataInFlight = new Map<string, Promise<AiReviewData>>()
const aiReviewHistoryCache = new Map<string, { value: AiRecommendationHistoryResponse[]; expiresAt: number }>()
const aiReviewHistoryInFlight = new Map<string, Promise<AiRecommendationHistoryResponse[]>>()

function getAuthCacheKey(): string {
  return localStorage.getItem('accessToken') ?? 'guest'
}

async function getAiReviewEligibility(cacheKey: string): Promise<boolean> {
  const now = Date.now()
  const cached = aiReviewEligibilityCache.get(cacheKey)
  if (cached && cached.expiresAt > now) {
    return cached.value
  }

  const inFlight = aiReviewEligibilityInFlight.get(cacheKey)
  if (inFlight) {
    return inFlight
  }

  const request = fetchMySubscription()
    .then((subscription) => !!subscription?.canUseAiRecommendations)
    .catch(() => false)
    .then((value) => {
      aiReviewEligibilityCache.set(cacheKey, {
        value,
        expiresAt: Date.now() + AI_REVIEW_ELIGIBILITY_CACHE_TTL_MS,
      })
      return value
    })
    .finally(() => {
      aiReviewEligibilityInFlight.delete(cacheKey)
    })

  aiReviewEligibilityInFlight.set(cacheKey, request)
  return request
}

async function getAiReviewData(cacheKey: string, force = false): Promise<AiReviewData> {
  if (!force) {
    const now = Date.now()
    const cached = aiReviewDataCache.get(cacheKey)
    if (cached && cached.expiresAt > now) {
      return cached.value
    }

    const inFlight = aiReviewDataInFlight.get(cacheKey)
    if (inFlight) {
      return inFlight
    }
  }

  const request = Promise.all([
    fetchAiRecommendations(20),
    fetchCategoryAccuracy().catch(() => [] as CategoryAccuracyResponse[]),
  ])
    .then(([recommendations, categoryAccuracy]) => {
      const value: AiReviewData = { recommendations, categoryAccuracy }
      aiReviewDataCache.set(cacheKey, {
        value,
        expiresAt: Date.now() + AI_REVIEW_DATA_CACHE_TTL_MS,
      })
      return value
    })
    .finally(() => {
      aiReviewDataInFlight.delete(cacheKey)
    })

  aiReviewDataInFlight.set(cacheKey, request)
  return request
}

async function getAiReviewHistory(cacheKey: string, force = false): Promise<AiRecommendationHistoryResponse[]> {
  if (!force) {
    const now = Date.now()
    const cached = aiReviewHistoryCache.get(cacheKey)
    if (cached && cached.expiresAt > now) {
      return cached.value
    }

    const inFlight = aiReviewHistoryInFlight.get(cacheKey)
    if (inFlight) {
      return inFlight
    }
  }

  const request = fetchAiRecommendationHistory(0, AI_REVIEW_HISTORY_PAGE_SIZE)
    .then((response) => {
      aiReviewHistoryCache.set(cacheKey, {
        value: response.content,
        expiresAt: Date.now() + AI_REVIEW_HISTORY_CACHE_TTL_MS,
      })
      return response.content
    })
    .finally(() => {
      aiReviewHistoryInFlight.delete(cacheKey)
    })

  aiReviewHistoryInFlight.set(cacheKey, request)
  return request
}

function formatQuotaResetAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatHistoryCreatedAt(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function tryParseHistoryPayload(payload: string): { reviewStrategy: string | null; weakConcepts: AiRecommendationWeakConcept[] } | null {
  const normalized = payload.trim()
  if (!normalized) {
    return null
  }

  const candidates = [normalized]
  const fencedMatch = normalized.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fencedMatch?.[1]) {
    candidates.push(fencedMatch[1].trim())
  }
  const start = normalized.indexOf('{')
  const end = normalized.lastIndexOf('}')
  if (start !== -1 && end > start) {
    candidates.push(normalized.slice(start, end + 1))
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>
      const reviewStrategyRaw = parsed.reviewStrategy
      const reviewStrategy =
        typeof reviewStrategyRaw === 'string' && reviewStrategyRaw.trim().length > 0
          ? reviewStrategyRaw.trim()
          : null

      const weakConceptsRaw = Array.isArray(parsed.weakConcepts) ? parsed.weakConcepts : []
      const weakConcepts = weakConceptsRaw
        .map((item) => {
          if (!item || typeof item !== 'object') {
            return null
          }
          const record = item as Record<string, unknown>
          const concept = typeof record.concept === 'string' ? record.concept.trim() : ''
          if (!concept) {
            return null
          }
          const reason = typeof record.reason === 'string' ? record.reason.trim() : ''
          return { concept, reason }
        })
        .filter((item): item is AiRecommendationWeakConcept => item !== null)

      if (!reviewStrategy && weakConcepts.length === 0) {
        continue
      }

      return { reviewStrategy, weakConcepts }
    } catch {
      continue
    }
  }

  return null
}

export function StudyPage({ forcedMode, hideModeSelector = false }: StudyPageProps = {}) {
  const navigate = useNavigate()
  const lastLoadTimeRef = useRef(0)
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('deck') || undefined
  const rawMode = forcedMode ?? ((searchParams.get('mode') as StudyMode) || 'all')
  const modeParam = rawMode === 'recommended' ? 'review' : rawMode

  const { categories, isLoading: isCategoriesLoading } = useCategories()
  const [selectedMode, setSelectedMode] = useState<StudyMode>(modeParam)
  const { isLoggedIn, isLoading: authLoading, isAdmin } = useAuth()

  const [canUseAiReview, setCanUseAiReview] = useState(false)
  const [isAiReviewEligibilityLoading, setIsAiReviewEligibilityLoading] = useState(false)

  useEffect(() => {
    setSelectedMode(modeParam)
  }, [modeParam])

  useEffect(() => {
    if (authLoading || !isLoggedIn) {
      setCanUseAiReview(false)
      setIsAiReviewEligibilityLoading(false)
      return
    }

    if (isAdmin) {
      setCanUseAiReview(true)
      setIsAiReviewEligibilityLoading(false)
      return
    }

    let isCancelled = false
    setIsAiReviewEligibilityLoading(true)

    const cacheKey = getAuthCacheKey()
    getAiReviewEligibility(cacheKey)
      .then((canUseAiRecommendations) => {
        if (isCancelled) return
        setCanUseAiReview(canUseAiRecommendations)
      })
      .catch(() => {
        if (isCancelled) return
        setCanUseAiReview(false)
      })
      .finally(() => {
        if (!isCancelled) {
          setIsAiReviewEligibilityLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [authLoading, isLoggedIn, isAdmin])

  // 추천 관련 상태
  const [recommendations, setRecommendations] = useState<AiRecommendationResponse | null>(null)
  const [categoryAccuracy, setCategoryAccuracy] = useState<CategoryAccuracyResponse[]>([])
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false)
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null)
  const [isAiRecommendationLocked, setIsAiRecommendationLocked] = useState(false)
  const [hasRequestedAiReview, setHasRequestedAiReview] = useState(false)
  const [historyItems, setHistoryItems] = useState<AiRecommendationHistoryResponse[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const isAiReviewMode = selectedMode === 'review' && canUseAiReview

  const {
    currentCard,
    currentIndex,
    isLoading,
    error,
    isFlipped,
    isRateLimited,
    loadCards,
    flipCard,
    answerCard,
    clearRateLimitError,
    progress,
  } = useStudyCards()

  const loadAiReviewHistory = useCallback(async (force = false) => {
    try {
      setIsHistoryLoading(true)
      setHistoryError(null)

      const cacheKey = getAuthCacheKey()
      const history = await getAiReviewHistory(cacheKey, force)
      setHistoryItems(history)
    } catch {
      setHistoryError('AI 복습 히스토리를 불러오는데 실패했습니다.')
    } finally {
      setIsHistoryLoading(false)
    }
  }, [])

  // 추천 데이터 로드 함수 (요청 버튼 + retry 버튼에서 공유)
  const loadRecommendations = useCallback(async (force = false) => {
    try {
      setIsRecommendationsLoading(true)
      setRecommendationsError(null)
      setIsAiRecommendationLocked(false)

      const cacheKey = getAuthCacheKey()
      const { recommendations: recData, categoryAccuracy: accData } = await getAiReviewData(cacheKey, force)

      setRecommendations(recData)
      setCategoryAccuracy(accData)
      void loadAiReviewHistory(true)
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 403) {
        setIsAiRecommendationLocked(true)
        setRecommendations(null)
        setCategoryAccuracy([])
        return
      }
      setRecommendationsError('AI 추천 카드를 불러오는데 실패했습니다.')
    } finally {
      setIsRecommendationsLoading(false)
    }
  }, [loadAiReviewHistory])

  useEffect(() => {
    if (!isAiReviewMode) {
      setHasRequestedAiReview(false)
      return
    }

    setHasRequestedAiReview(false)
    setRecommendations(null)
    setCategoryAccuracy([])
    setRecommendationsError(null)
    setIsAiRecommendationLocked(false)
  }, [isAiReviewMode])

  useEffect(() => {
    if (!isAiReviewMode) return
    void loadAiReviewHistory(false)
  }, [isAiReviewMode, loadAiReviewHistory])

  useEffect(() => {
    if (authLoading || isAiReviewEligibilityLoading) return
    if (isAiReviewMode) return
    const now = Date.now()
    if (now - lastLoadTimeRef.current < STUDY_LOAD_DEBOUNCE_MS) return
    lastLoadTimeRef.current = now

    if (selectedMode === 'session-review') {
      // sessionStorage에서 cardIds 가져오기
      const storedIds = sessionStorage.getItem('reviewCardIds')
      if (storedIds) {
        try {
          const cardIds = JSON.parse(storedIds) as number[]
          if (Array.isArray(cardIds) && cardIds.length > 0) {
            sessionStorage.removeItem('reviewCardIds')
            loadCards(undefined, 'session-review', cardIds, isLoggedIn)
          } else {
            sessionStorage.removeItem('reviewCardIds')
            loadCards(category, 'all', undefined, isLoggedIn)
          }
        } catch {
          sessionStorage.removeItem('reviewCardIds')
          loadCards(category, 'all', undefined, isLoggedIn)
        }
      } else {
        // cardIds가 없으면 전체 학습으로 전환
        loadCards(category, 'all', undefined, isLoggedIn)
      }
    } else {
      loadCards(category, selectedMode, undefined, isLoggedIn)
    }
  }, [loadCards, category, selectedMode, isLoggedIn, authLoading, isAiReviewEligibilityLoading, isAiReviewMode])

  const handleCategoryChange = (categoryCode: string | undefined) => {
    const nextCategory = categoryCode ?? 'ALL'
    const currentCategory = category ?? 'ALL'
    if (nextCategory === currentCategory) return

    const params: Record<string, string> = {}
    if (categoryCode) params.deck = categoryCode
    if (!forcedMode && selectedMode !== 'all') params.mode = selectedMode
    setSearchParams(params, { replace: true })
  }

  const handleModeChange = (mode: StudyMode) => {
    if (forcedMode) return
    if (mode === selectedMode) return

    setSelectedMode(mode)
    const params: Record<string, string> = {}
    if (category) params.deck = category
    if (mode !== 'all') params.mode = mode
    setSearchParams(params, { replace: true })
  }

  const handleRetry = () => {
    if (isAiReviewMode) {
      void loadRecommendations(true)
      return
    }
    loadCards(category, selectedMode, undefined, isLoggedIn)
  }

  const handleRequestAiReview = () => {
    setHasRequestedAiReview(true)
    void loadRecommendations(false)
  }

  const handleNewSession = () => {
    loadCards(category, selectedMode, undefined, isLoggedIn)
  }

  const getModeLabel = () => {
    switch (selectedMode) {
      case 'review':
        return '오늘의 복습'
      case 'myCards':
        return '내 카드'
      case 'session-review':
        return '세션 복습'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        variant="back-title"
        container="container"
        backTo={isLoggedIn ? DASHBOARD_PATH : '/'}
        backLabel="뒤로가기"
        hideBackLabelOnMobile
        title={`${getModeLabel()}${getModeLabel() && ' '}${category ? `${category} 학습` : '학습 세션'}`}
        sticky
        stickyTone="background"
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Study Mode Selection */}
        {isLoggedIn && !hideModeSelector && (
          <div className="max-w-2xl mx-auto mb-4 md:mb-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">학습 모드</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleModeChange('all')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-colors min-h-[44px] ${
                  selectedMode === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                전체 학습
              </button>
              <button
                onClick={() => handleModeChange('review')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-colors min-h-[44px] ${
                  selectedMode === 'review'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <CalendarCheck className="h-4 w-4" />
                오늘의 복습
              </button>
              <button
                onClick={() => handleModeChange('myCards')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-colors min-h-[44px] ${
                  selectedMode === 'myCards'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <User className="h-4 w-4" />
                내 카드만
              </button>
            </div>
          </div>
        )}

        {/* Category Filter (AI 기반 오늘의 복습에서는 숨김) */}
        {!isAiReviewMode && (
          <CategoryFilterSection
            className="max-w-2xl mx-auto mb-4 md:mb-6"
            categories={categories}
            isLoading={isCategoriesLoading}
            selectedCategory={category ?? 'ALL'}
            onChange={(code) => handleCategoryChange(code === 'ALL' ? undefined : code)}
            collapsible
            autoCloseOnSelect
            title="카테고리"
            loadingText="카테고리 로딩 중..."
            buttonBaseClassName="px-3 py-2 text-sm rounded-md transition-colors min-h-[38px]"
          />
        )}

        {/* AI 기반 오늘의 복습 뷰 */}
        {selectedMode === 'review' && isAiReviewEligibilityLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">복습 모드를 확인하는 중...</p>
          </div>
        ) : isAiReviewMode ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {!hasRequestedAiReview ? (
              <div className="text-center p-6 md:p-8 rounded-lg bg-secondary/50">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-lg md:text-xl font-semibold mb-2">AI 복습 분석을 시작하세요</h2>
                <p className="text-muted-foreground mb-4 text-sm md:text-base">
                  요청 시점에만 AI 추천 카드, 취약 개념, 복습 전략을 불러옵니다.
                </p>
                <Button onClick={handleRequestAiReview} className="min-h-[44px]">
                  AI 복습 분석 요청
                </Button>
              </div>
            ) : isRecommendationsLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">추천 카드를 분석하는 중...</p>
              </div>
            ) : isAiRecommendationLocked ? (
              <div className="text-center p-6 md:p-8 rounded-lg bg-amber-50 border border-amber-200">
                <Crown className="h-12 w-12 mx-auto mb-4 text-amber-600" />
                <h2 className="text-lg md:text-xl font-semibold mb-2">AI 추천은 PRO 플랜에서 제공됩니다</h2>
                <p className="text-muted-foreground mb-4 text-sm md:text-base">
                  학습 기록 기반 취약 개념 분석과 오늘의 맞춤 복습 전략을 확인하려면 업그레이드하세요.
                </p>
                <Button asChild className="min-h-[44px]">
                  <Link to="/subscription">PRO 업그레이드</Link>
                </Button>
              </div>
            ) : recommendationsError ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-destructive mb-4">{recommendationsError}</p>
                <Button onClick={() => void loadRecommendations(true)} className="min-h-[44px]">
                  다시 시도
                </Button>
              </div>
            ) : recommendations ? (
              <div className="space-y-6">
                <div className="rounded-xl border bg-card p-4 md:p-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                      <Sparkles className="h-3.5 w-3.5" />
                      {recommendations.aiUsed ? 'AI 추천 사용' : '알고리즘 추천 제공'}
                    </span>
                    {recommendations.algorithmFallback && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-xs font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        AI 폴백
                      </span>
                    )}
                  </div>
                  <p className="text-sm md:text-base text-foreground">
                    {recommendations.reviewStrategy}
                  </p>
                  {recommendations.algorithmFallback && (
                    <p className="text-xs text-amber-700">
                      AI 한도 또는 일시적 오류로 알고리즘 추천 결과를 제공하고 있습니다.
                    </p>
                  )}
                  {recommendations.quota && (
                    <p className="text-xs text-muted-foreground">
                      AI 추천 사용량 {recommendations.quota.used}/{recommendations.quota.limit}
                      {' · '}남은 {recommendations.quota.remaining}
                      {' · '}초기화 {formatQuotaResetAt(recommendations.quota.resetAt)}
                    </p>
                  )}
                </div>

                {recommendations.weakConcepts.length > 0 && (
                  <div className="rounded-xl border bg-card p-4 md:p-5">
                    <h3 className="text-sm md:text-base font-semibold mb-3">취약 개념</h3>
                    <div className="space-y-2">
                      {recommendations.weakConcepts.map((item, index) => (
                        <div key={`${item.concept}-${index}`} className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-sm font-medium">{item.concept}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recommendations.recommendations.length === 0 ? (
                  <div className="text-center p-6 md:p-8 rounded-lg bg-secondary/50">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-lg md:text-xl font-semibold mb-2">추천 카드가 없습니다</h2>
                    <p className="text-muted-foreground text-sm md:text-base">
                      학습 데이터가 더 쌓이면 AI가 맞춤 카드를 추천해 드립니다.
                    </p>
                  </div>
                ) : (
                  <RecommendedCardList
                    recommendations={recommendations.recommendations}
                    aiExplanation={null}
                    canSeeAiExplanation
                  />
                )}
                {categoryAccuracy.length > 0 && (
                  <CategoryAccuracyChart data={categoryAccuracy} />
                )}
              </div>
            ) : null}

            <div className="rounded-xl border bg-card p-4 md:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm md:text-base font-semibold flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  AI 복습 히스토리
                </h3>
                {!historyError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-[36px] px-2.5 text-xs"
                    onClick={() => void loadAiReviewHistory(true)}
                    disabled={isHistoryLoading}
                  >
                    새로고침
                  </Button>
                )}
              </div>

              {isHistoryLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  히스토리를 불러오는 중...
                </div>
              ) : historyError ? (
                <div className="space-y-2">
                  <p className="text-sm text-destructive">{historyError}</p>
                  <Button size="sm" className="min-h-[36px]" onClick={() => void loadAiReviewHistory(true)}>
                    다시 시도
                  </Button>
                </div>
              ) : historyItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">아직 저장된 AI 복습 내역이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {historyItems.map((item) => {
                    const parsedPayload = item.response ? tryParseHistoryPayload(item.response) : null
                    const strategy = parsedPayload?.reviewStrategy ?? null
                    const weakConcepts = parsedPayload?.weakConcepts ?? []
                    const fallbackResponse =
                      item.response?.trim().slice(0, 140) ?? ''

                    return (
                      <div key={item.id} className="rounded-lg border bg-secondary/30 p-3 space-y-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                              item.success
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {item.success ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            {item.success ? '성공' : '실패'}
                          </span>
                          <span className="text-muted-foreground">{formatHistoryCreatedAt(item.createdAt)}</span>
                          {item.model && (
                            <span className="text-muted-foreground">모델: {item.model}</span>
                          )}
                        </div>

                        {strategy ? (
                          <p className="text-sm text-foreground">{strategy}</p>
                        ) : item.success ? (
                          <p className="text-sm text-muted-foreground">
                            {fallbackResponse || '응답 전문만 저장되어 전략을 추출하지 못했습니다.'}
                          </p>
                        ) : (
                          <p className="text-sm text-red-700">
                            {item.errorMessage || 'AI 복습 분석 요청에 실패했습니다.'}
                          </p>
                        )}

                        {weakConcepts.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {weakConcepts.slice(0, 3).map((weakConcept, index) => (
                              <span
                                key={`${item.id}-${weakConcept.concept}-${index}`}
                                className="inline-flex rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs"
                              >
                                {weakConcept.concept}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">카드를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={handleRetry} className="min-h-[44px]">다시 시도</Button>
          </div>
        ) : progress.total === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center p-6 md:p-8 rounded-lg bg-secondary/50">
              <CalendarCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {selectedMode === 'review' ? (
                <>
                  <h2 className="text-lg md:text-xl font-semibold mb-2">오늘 복습할 카드가 없습니다</h2>
                  <p className="text-muted-foreground mb-4 text-sm md:text-base">
                    모든 카드를 복습했거나, 아직 학습 기록이 없습니다.
                  </p>
                  <Button
                    onClick={() => {
                      if (forcedMode === 'review') {
                        navigate('/study')
                        return
                      }
                      handleModeChange('all')
                    }}
                    className="min-h-[44px]"
                  >
                    전체 학습하기
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-lg md:text-xl font-semibold mb-2">카드가 없습니다</h2>
                  <p className="text-muted-foreground text-sm md:text-base">
                    {selectedMode === 'myCards'
                      ? '내 카드를 먼저 만들어보세요.'
                      : '해당 카테고리에 카드가 없습니다.'}
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-4 md:mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>{progress.completed}/{progress.total} 완료</span>
                <span>
                  {progress.correct}/{progress.completed} 정답
                  {progress.completed > 0 && (
                    <span className="ml-1 text-primary font-medium">
                      ({Math.round((progress.correct / progress.completed) * 100)}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${
                      progress.total > 0
                        ? (progress.completed / progress.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Card Deck */}
            <CardDeck
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={flipCard}
              onCorrect={() => answerCard(true)}
              onIncorrect={() => answerCard(false)}
              currentIndex={currentIndex}
              totalCards={progress.total}
            />

            {/* Session Complete */}
            {progress.completed === progress.total && progress.total > 0 && (
              <div className="mt-6 md:mt-8 text-center p-5 md:p-6 rounded-xl bg-primary/10">
                <h2 className="text-lg md:text-xl font-semibold mb-2">
                  {selectedMode === 'review' ? '오늘의 복습 완료!' : '학습 완료!'}
                </h2>
                <p className="text-muted-foreground mb-4 text-sm md:text-base">
                  {progress.total}개 중 {progress.correct}개 정답 (
                  {Math.round((progress.correct / progress.total) * 100)}%)
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleNewSession} className="min-h-[44px]">새 세션</Button>
                  <Button variant="outline" asChild className="min-h-[44px]">
                    <Link to={isLoggedIn ? DASHBOARD_PATH : '/'}>홈으로</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Rate Limit Modal */}
      <RateLimitModal
        isOpen={isRateLimited}
        onClose={clearRateLimitError}
      />
    </div>
  )
}
