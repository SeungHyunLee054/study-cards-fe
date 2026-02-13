import { useState } from 'react'
import { ChevronDown, ChevronUp, Sparkles, Crown, Calendar, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { PriorityBadge } from './PriorityBadge'
import type { RecommendedCard } from '@/types/recommendation'
import { Link } from 'react-router-dom'

interface RecommendedCardListProps {
  recommendations: RecommendedCard[]
  aiExplanation: string | null
  canSeeAiExplanation: boolean
}

export function RecommendedCardList({
  recommendations,
  aiExplanation,
  canSeeAiExplanation,
}: RecommendedCardListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getCardKey = (card: RecommendedCard) =>
    card.cardId ? `public-${card.cardId}` : `custom-${card.userCardId}`

  return (
    <div className="space-y-4">
      {/* AI 설명 배너 (PRO만) */}
      {canSeeAiExplanation && aiExplanation && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-100 shrink-0">
              <Sparkles className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900 mb-1">AI 학습 분석</p>
              <p className="text-sm text-purple-700">{aiExplanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* PRO 업그레이드 유도 */}
      {!canSeeAiExplanation && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 shrink-0">
                <Crown className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-sm text-amber-800">
                PRO 플랜으로 AI 맞춤 학습 분석을 받아보세요
              </p>
            </div>
            <Link
              to="/subscription"
              className="text-xs font-medium text-amber-700 hover:text-amber-900 whitespace-nowrap underline"
            >
              업그레이드
            </Link>
          </div>
        </div>
      )}

      {/* 추천 카드 수 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          추천 카드 <span className="font-medium text-foreground">{recommendations.length}</span>개
        </p>
      </div>

      {/* 카드 리스트 */}
      <div className="space-y-2">
        {recommendations.map((card) => {
          const key = getCardKey(card)
          const isExpanded = expandedId === key

          return (
            <div
              key={key}
              className="border border-gray-200 rounded-xl bg-white overflow-hidden transition-shadow hover:shadow-sm"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : key)}
                className="w-full flex items-center gap-3 p-4 text-left min-h-[44px]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <PriorityBadge score={card.priorityScore} />
                    {card.lastCorrect ? (
                      <span className="text-xs text-green-600 flex items-center gap-0.5">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="hidden sm:inline">최근 정답</span>
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 flex items-center gap-0.5">
                        <XCircle className="h-3 w-3" />
                        <span className="hidden sm:inline">최근 오답</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm md:text-base font-medium text-gray-900 truncate">
                    {card.question}
                  </p>
                  {card.questionSub && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {card.questionSub}
                    </p>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-3 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>복습일: {new Date(card.nextReviewDate).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>난이도: {card.efFactor.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>우선순위: {card.priorityScore}점</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {card.cardId ? (
                        <span>공용 카드</span>
                      ) : (
                        <span>내 카드</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
