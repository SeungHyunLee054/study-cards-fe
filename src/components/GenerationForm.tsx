import { useState, useEffect, useMemo } from 'react'
import { X, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CategoryResponse } from '@/types/category'
import type { GenerationRequest } from '@/types/generation'
import { flattenCategoriesForSelect } from '@/lib/categoryHierarchy'

interface GenerationFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: GenerationRequest) => Promise<void>
  categories: CategoryResponse[]
  isLoading?: boolean
}

export function GenerationForm({
  isOpen,
  onClose,
  onSubmit,
  categories,
  isLoading,
}: GenerationFormProps) {
  const [categoryCode, setCategoryCode] = useState('')
  const [count, setCount] = useState(5)
  const [model, setModel] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const categoryOptions = useMemo(() => flattenCategoriesForSelect(categories), [categories])

  // 폼 초기화
  useEffect(() => {
    if (isOpen) {
      setCategoryCode(categoryOptions[0]?.code || '')
      setCount(5)
      setModel('')
      setErrors({})
    }
  }, [isOpen, categoryOptions])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!categoryCode) {
      newErrors.categoryCode = '카테고리를 선택해주세요'
    }
    if (count < 1 || count > 20) {
      newErrors.count = '생성 개수는 1-20 사이여야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    const data: GenerationRequest = {
      categoryCode,
      count,
      ...(model.trim() && { model: model.trim() }),
    }

    await onSubmit(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">AI 문제 생성</h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 카테고리 선택 */}
          <div>
            <Label htmlFor="categoryCode">카테고리 *</Label>
            <select
              id="categoryCode"
              value={categoryCode}
              onChange={(e) => setCategoryCode(e.target.value)}
              className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              disabled={isLoading}
            >
              <option value="">카테고리 선택</option>
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.code}>
                  {option.pathLabel} ({option.code})
                </option>
              ))}
            </select>
            {errors.categoryCode && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryCode}</p>
            )}
          </div>

          {/* AI 모델 */}
          <div>
            <Label htmlFor="model">AI 모델</Label>
            <Input
              id="model"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
              className="mt-1"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">비워두면 서버 기본값 사용</p>
          </div>

          {/* 생성 개수 */}
          <div>
            <Label htmlFor="count">생성 개수 (1-20) *</Label>
            <Input
              id="count"
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="mt-1"
              disabled={isLoading}
            />
            {errors.count && <p className="mt-1 text-sm text-red-600">{errors.count}</p>}
          </div>

          {/* 안내 문구 */}
          <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
            AI가 선택한 카테고리에 맞는 학습 문제를 생성합니다. 생성된 문제는 검토 후 승인해야 실제
            학습 카드로 사용할 수 있습니다.
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
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  문제 생성
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
