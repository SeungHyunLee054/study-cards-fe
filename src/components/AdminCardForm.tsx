import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Category } from '@/types/card'
import type { AdminCardResponse, AdminCardCreateRequest } from '@/types/admin'

const CATEGORIES: Category[] = ['CS', 'ENGLISH', 'SQL', 'JAPANESE']

interface AdminCardFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AdminCardCreateRequest) => Promise<void>
  initialData?: AdminCardResponse | null
  isLoading?: boolean
}

export function AdminCardForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: AdminCardFormProps) {
  const [questionEn, setQuestionEn] = useState('')
  const [questionKo, setQuestionKo] = useState('')
  const [answerEn, setAnswerEn] = useState('')
  const [answerKo, setAnswerKo] = useState('')
  const [category, setCategory] = useState<Category>('CS')
  const [efFactor, setEfFactor] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = !!initialData

  useEffect(() => {
    if (initialData) {
      setQuestionEn(initialData.questionEn)
      setQuestionKo(initialData.questionKo || '')
      setAnswerEn(initialData.answerEn)
      setAnswerKo(initialData.answerKo || '')
      setCategory(initialData.category as Category)
      setEfFactor(initialData.efFactor.toString())
    } else {
      setQuestionEn('')
      setQuestionKo('')
      setAnswerEn('')
      setAnswerKo('')
      setCategory('CS')
      setEfFactor('')
    }
    setErrors({})
  }, [initialData, isOpen])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!questionEn.trim()) {
      newErrors.questionEn = '질문(영어)을 입력해주세요'
    }
    if (!answerEn.trim()) {
      newErrors.answerEn = '답변(영어)을 입력해주세요'
    }
    if (!category) {
      newErrors.category = '카테고리를 선택해주세요'
    }
    if (efFactor && (isNaN(parseFloat(efFactor)) || parseFloat(efFactor) < 1.3)) {
      newErrors.efFactor = 'EF Factor는 1.3 이상이어야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    const data: AdminCardCreateRequest = {
      questionEn: questionEn.trim(),
      questionKo: questionKo.trim() || undefined,
      answerEn: answerEn.trim(),
      answerKo: answerKo.trim() || undefined,
      category,
      efFactor: efFactor ? parseFloat(efFactor) : undefined,
    }

    await onSubmit(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? '카드 수정' : '새 카드 만들기'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="category">카테고리 *</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <div>
            <Label htmlFor="questionEn">질문 (영어) *</Label>
            <Input
              id="questionEn"
              value={questionEn}
              onChange={(e) => setQuestionEn(e.target.value)}
              placeholder="영어로 질문을 입력하세요"
              className="mt-1"
              disabled={isLoading}
            />
            {errors.questionEn && (
              <p className="mt-1 text-sm text-red-600">{errors.questionEn}</p>
            )}
          </div>

          <div>
            <Label htmlFor="questionKo">질문 (한국어)</Label>
            <Input
              id="questionKo"
              value={questionKo}
              onChange={(e) => setQuestionKo(e.target.value)}
              placeholder="한국어로 질문을 입력하세요 (선택)"
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="answerEn">답변 (영어) *</Label>
            <Input
              id="answerEn"
              value={answerEn}
              onChange={(e) => setAnswerEn(e.target.value)}
              placeholder="영어로 답변을 입력하세요"
              className="mt-1"
              disabled={isLoading}
            />
            {errors.answerEn && (
              <p className="mt-1 text-sm text-red-600">{errors.answerEn}</p>
            )}
          </div>

          <div>
            <Label htmlFor="answerKo">답변 (한국어)</Label>
            <Input
              id="answerKo"
              value={answerKo}
              onChange={(e) => setAnswerKo(e.target.value)}
              placeholder="한국어로 답변을 입력하세요 (선택)"
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="efFactor">EF Factor (선택, 최소 1.3)</Label>
            <Input
              id="efFactor"
              type="number"
              step="0.1"
              min="1.3"
              value={efFactor}
              onChange={(e) => setEfFactor(e.target.value)}
              placeholder="기본값: 2.5"
              className="mt-1"
              disabled={isLoading}
            />
            {errors.efFactor && (
              <p className="mt-1 text-sm text-red-600">{errors.efFactor}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? '저장 중...' : '생성 중...'}
                </>
              ) : isEdit ? (
                '변경사항 저장'
              ) : (
                '카드 만들기'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
