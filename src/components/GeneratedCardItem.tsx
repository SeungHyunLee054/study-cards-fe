import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GeneratedCardResponse, GeneratedCardStatus } from '@/types/generation'

interface GeneratedCardItemProps {
  card: GeneratedCardResponse
  isSelected: boolean
  onSelect: (id: number, selected: boolean) => void
  onApprove: (id: number) => void
  onReject: (id: number) => void
  isApproving?: boolean
  isRejecting?: boolean
}

export function GeneratedCardItem({
  card,
  isSelected,
  onSelect,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: GeneratedCardItemProps) {
  const isActionInProgress = isApproving || isRejecting
  const canApprove = card.status !== 'APPROVED' && card.status !== 'MIGRATED'
  const canReject = card.status !== 'REJECTED' && card.status !== 'MIGRATED'
  const canSelectForBatchApprove = canApprove
  const approveLabel = card.status === 'REJECTED' ? '재승인' : '승인'
  const rejectLabel = card.status === 'APPROVED' ? '승인 취소' : '거부'

  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* 체크박스 */}
        {canSelectForBatchApprove && (
          <div className="pt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(card.id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              disabled={isActionInProgress}
            />
          </div>
        )}

        {/* 카드 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StatusBadge status={card.status} />
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-primary/10 text-primary">
              {card.category.name}
            </span>
            <span className="text-xs text-gray-400">{card.model}</span>
            <span className="text-xs text-gray-400">ID: #{card.id}</span>
          </div>

          {/* 원본 단어 */}
          {card.sourceWord && (
            <div className="mb-2 text-xs text-gray-500">
              원본: <span className="font-medium">{card.sourceWord}</span>
            </div>
          )}

          {/* 질문 */}
          <div className="mb-3">
            <p className="font-medium text-gray-900">{card.question}</p>
            {card.questionSub && <p className="text-sm text-gray-500 mt-1">{card.questionSub}</p>}
          </div>

          {/* 답변 */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{card.answer}</p>
            {card.answerSub && <p className="text-sm text-gray-500 mt-1">{card.answerSub}</p>}
          </div>

          {/* 날짜 정보 */}
          <div className="mt-2 text-xs text-gray-400">
            생성: {new Date(card.createdAt).toLocaleDateString('ko-KR')}
            {card.approvedAt && (
              <span className="ml-2">
                승인: {new Date(card.approvedAt).toLocaleDateString('ko-KR')}
              </span>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        {(canApprove || canReject) && (
          <div className="flex flex-col gap-2">
            {canApprove && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApprove(card.id)}
                disabled={isActionInProgress}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 min-h-[44px]"
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {approveLabel}
                  </>
                )}
              </Button>
            )}
            {canReject && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(card.id)}
                disabled={isActionInProgress}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 min-h-[44px]"
              >
                {isRejecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-1" />
                    {rejectLabel}
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface StatusBadgeProps {
  status: GeneratedCardStatus
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config: Record<GeneratedCardStatus, { label: string; className: string }> = {
    PENDING: {
      label: '대기중',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    },
    APPROVED: {
      label: '승인됨',
      className: 'bg-green-100 text-green-700 border-green-200',
    },
    REJECTED: {
      label: '거부됨',
      className: 'bg-red-100 text-red-700 border-red-200',
    },
    MIGRATED: {
      label: '마이그레이션',
      className: 'bg-purple-100 text-purple-700 border-purple-200',
    },
  }

  const { label, className } = config[status]

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${className}`}>{label}</span>
  )
}
