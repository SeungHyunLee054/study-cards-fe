import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { UserCardResponse, UserCardCreateRequest } from '@/types/card'
import type { CategoryResponse } from '@/types/category'

interface CardFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UserCardCreateRequest) => Promise<void>
  initialData?: UserCardResponse | null
  categories?: CategoryResponse[]
  isLoading?: boolean
}

export function CardForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories = [],
  isLoading,
}: CardFormProps) {
  const [question, setQuestion] = useState('')
  const [questionSub, setQuestionSub] = useState('')
  const [answer, setAnswer] = useState('')
  const [answerSub, setAnswerSub] = useState('')
  const [category, setCategory] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = !!initialData

  // 폼 데이터 초기화 (initialData나 isOpen 변경 시에만)
  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question)
      setQuestionSub(initialData.questionSub || '')
      setAnswer(initialData.answer)
      setAnswerSub(initialData.answerSub || '')
      setCategory(initialData.category.code)
    } else {
      setQuestion('')
      setQuestionSub('')
      setAnswer('')
      setAnswerSub('')
      setCategory((prev) => prev || categories[0]?.code || '')
    }
    setErrors({})
  }, [initialData, isOpen])

  // 카테고리 로드 시 기본값 설정
  useEffect(() => {
    if (!initialData && !category && categories.length > 0) {
      setCategory(categories[0].code)
    }
  }, [categories, initialData, category])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!question.trim()) {
      newErrors.question = '질문을 입력해주세요'
    }
    if (!answer.trim()) {
      newErrors.answer = '답변을 입력해주세요'
    }
    if (!category) {
      newErrors.category = '카테고리를 선택해주세요'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    const data: UserCardCreateRequest = {
      question: question.trim(),
      questionSub: questionSub.trim() || undefined,
      answer: answer.trim(),
      answerSub: answerSub.trim() || undefined,
      category,
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
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            >
              <option value="">카테고리 선택</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.code}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <div>
            <Label htmlFor="question">질문 *</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="질문을 입력하세요"
              className="mt-1"
              disabled={isLoading}
            />
            {errors.question && (
              <p className="mt-1 text-sm text-red-600">{errors.question}</p>
            )}
          </div>

          <div>
            <Label htmlFor="questionSub">질문 (보조)</Label>
            <Input
              id="questionSub"
              value={questionSub}
              onChange={(e) => setQuestionSub(e.target.value)}
              placeholder="보조 질문을 입력하세요 (선택)"
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="answer">답변 *</Label>
            <Input
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="답변을 입력하세요"
              className="mt-1"
              disabled={isLoading}
            />
            {errors.answer && (
              <p className="mt-1 text-sm text-red-600">{errors.answer}</p>
            )}
          </div>

          <div>
            <Label htmlFor="answerSub">답변 (보조)</Label>
            <Input
              id="answerSub"
              value={answerSub}
              onChange={(e) => setAnswerSub(e.target.value)}
              placeholder="보조 답변을 입력하세요 (선택)"
              className="mt-1"
              disabled={isLoading}
            />
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
              ) : (
                isEdit ? '변경사항 저장' : '카드 만들기'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
