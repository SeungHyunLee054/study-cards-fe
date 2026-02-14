import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Loader2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Wand2,
  AlertCircle,
} from 'lucide-react'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/useAuth'
import { fetchCategories } from '@/api/categories'
import { generateUserCards, fetchAiGenerationLimit } from '@/api/ai'
import type { CategoryResponse } from '@/types/category'
import type { AiCardResponse, AiLimitResponse } from '@/types/ai'
import { flattenCategoriesForSelect } from '@/lib/categoryHierarchy'

export function AiGeneratePage() {
  const { isLoggedIn } = useAuth()

  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [sourceText, setSourceText] = useState('')
  const [categoryCode, setCategoryCode] = useState('')
  const [count, setCount] = useState(5)
  const [difficulty, setDifficulty] = useState('MEDIUM')

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCards, setGeneratedCards] = useState<AiCardResponse[]>([])
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [limitInfo, setLimitInfo] = useState<AiLimitResponse | null>(null)
  const [isLoadingLimit, setIsLoadingLimit] = useState(true)
  const categoryOptions = useMemo(() => flattenCategoriesForSelect(categories), [categories])

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (categoryOptions.length === 0) {
      setCategoryCode('')
      return
    }

    if (!categoryCode || !categoryOptions.some((option) => option.code === categoryCode)) {
      setCategoryCode(categoryOptions[0].code)
    }
  }, [categoryCode, categoryOptions])

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoadingLimit(false)
      return
    }
    fetchAiGenerationLimit()
      .then(setLimitInfo)
      .catch(() => setLimitInfo(null))
      .finally(() => setIsLoadingLimit(false))
  }, [isLoggedIn])

  async function handleGenerate() {
    if (!sourceText.trim() || !categoryCode) return

    try {
      setIsGenerating(true)
      setError(null)
      setGeneratedCards([])

      const result = await generateUserCards({
        sourceText: sourceText.trim(),
        categoryCode,
        count,
        difficulty,
      })

      setGeneratedCards(result.generatedCards)
      if (limitInfo) {
        setLimitInfo({ ...limitInfo, used: limitInfo.used + result.count, remaining: result.remainingLimit })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 카드 생성에 실패했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  const canGenerate = limitInfo ? limitInfo.remaining > 0 : false
  const textLength = sourceText.length

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader
          variant="back-title"
          container="max-w-3xl"
          backTo="/"
          backLabel="뒤로"
          hideBackLabelOnMobile
          title={(
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI 카드 생성
            </span>
          )}
          titleClassName="text-lg font-semibold"
        />
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <Sparkles className="h-16 w-16 mx-auto mb-6 text-primary/30" />
          <h2 className="text-2xl font-bold mb-3">로그인이 필요합니다</h2>
          <p className="text-muted-foreground mb-6">AI 카드 생성을 이용하려면 먼저 로그인하세요.</p>
          <Button asChild>
            <Link to="/login?redirect=/ai-generate">로그인하기</Link>
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        variant="back-title"
        container="max-w-3xl"
        backTo="/dashboard"
        backLabel="뒤로"
        hideBackLabelOnMobile
        title={(
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI 카드 생성
          </span>
        )}
        titleClassName="text-lg font-semibold"
        rightSlot={!isLoadingLimit && limitInfo ? (
          <div className="text-sm text-muted-foreground">
            {limitInfo.isLifetime ? (
              <span>남은 횟수: <strong className="text-foreground">{limitInfo.remaining}</strong>/{limitInfo.limit}</span>
            ) : (
              <span>오늘: <strong className="text-foreground">{limitInfo.used}</strong>/{limitInfo.limit}</span>
            )}
          </div>
        ) : undefined}
        className="shrink-0"
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {/* Limit Warning */}
          {!isLoadingLimit && limitInfo && limitInfo.remaining <= 0 && (
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800">
                  {limitInfo.isLifetime ? 'AI 생성 체험 횟수를 모두 사용했습니다.' : '오늘의 AI 생성 한도를 초과했습니다.'}
                </p>
                <p className="text-sm text-orange-600 mt-1">
                  {limitInfo.isLifetime ? (
                    <Link to="/subscription" className="underline font-medium">PRO 플랜으로 업그레이드</Link>
                  ) : (
                    '내일 다시 이용할 수 있습니다.'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* PRO Upgrade Banner (for FREE users) */}
          {!isLoadingLimit && limitInfo && limitInfo.isLifetime && limitInfo.remaining > 0 && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wand2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">FREE 체험 중</p>
                  <p className="text-xs text-muted-foreground">
                    남은 {limitInfo.remaining}회 체험 후 PRO로 업그레이드하세요
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild className="min-h-[44px]">
                <Link to="/subscription">PRO 보기</Link>
              </Button>
            </div>
          )}

          {/* Source Text Input */}
          <div>
            <label className="block text-sm font-medium mb-2">학습할 텍스트</label>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="학습하고 싶은 내용을 입력하세요. AI가 자동으로 플래시카드를 생성합니다.&#10;&#10;예시: REST API는 Representational State Transfer의 약자로, 클라이언트와 서버 간의 통신을 위한 아키텍처 스타일입니다..."
              className="w-full min-h-[200px] p-4 text-base leading-relaxed border rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background"
              maxLength={5000}
              disabled={!canGenerate}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${textLength > 4500 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                {textLength.toLocaleString()} / 5,000
              </span>
            </div>
          </div>

          {/* Options Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">카테고리</label>
              <select
                value={categoryCode}
                onChange={(e) => setCategoryCode(e.target.value)}
                className="w-full h-11 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={!canGenerate}
              >
                {categoryOptions.map((option) => (
                  <option key={option.id} value={option.code}>
                    {option.pathLabel}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">카드 수</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full h-11 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={!canGenerate}
              >
                {[3, 5, 10, 15, 20].map((n) => (
                  <option key={n} value={n}>{n}개</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-muted-foreground">난이도</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full h-11 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={!canGenerate}
              >
                <option value="EASY">쉬움</option>
                <option value="MEDIUM">보통</option>
                <option value="HARD">어려움</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Loading Skeleton */}
          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                AI가 카드를 생성하고 있습니다...
              </div>
              {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border bg-secondary/30 animate-pulse">
                  <div className="h-4 bg-secondary rounded w-3/4 mb-3" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Generated Cards */}
          {generatedCards.length > 0 && !isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">
                  생성된 카드 ({generatedCards.length}개)
                </h2>
                <Button variant="outline" size="sm" asChild className="min-h-[44px]">
                  <Link to="/study?mode=myCards">
                    <BookOpen className="h-4 w-4 mr-1" />
                    바로 학습하기
                  </Link>
                </Button>
              </div>

              {generatedCards.map((card, index) => (
                <div
                  key={card.id}
                  className="rounded-xl border bg-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                    className="w-full p-4 text-left flex items-start justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                          Q{index + 1}
                        </span>
                        <span className="text-xs text-muted-foreground">{card.categoryCode}</span>
                      </div>
                      <p className="text-sm font-medium truncate">{card.question}</p>
                    </div>
                    {expandedCard === index ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                    )}
                  </button>

                  {expandedCard === index && (
                    <div className="px-4 pb-4 border-t bg-secondary/30">
                      <div className="pt-3 space-y-2">
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">질문</span>
                          <p className="text-sm mt-0.5">{card.question}</p>
                          {card.questionSub && (
                            <p className="text-xs text-muted-foreground mt-0.5">{card.questionSub}</p>
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-green-600">답변</span>
                          <p className="text-sm mt-0.5">{card.answer}</p>
                          {card.answerSub && (
                            <p className="text-xs text-muted-foreground mt-0.5">{card.answerSub}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Fixed Generate Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-3xl mx-auto">
          <Button
            className="w-full h-12 text-base"
            onClick={handleGenerate}
            disabled={isGenerating || !sourceText.trim() || !categoryCode || !canGenerate}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                AI로 카드 {count}개 생성하기
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
