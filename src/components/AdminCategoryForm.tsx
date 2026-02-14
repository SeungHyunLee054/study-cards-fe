import { useState, useEffect, useMemo } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CategoryResponse, CategoryCreateRequest } from '@/types/category'
import { flattenCategoriesForSelect } from '@/lib/categoryHierarchy'

interface AdminCategoryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CategoryCreateRequest) => Promise<void>
  initialData?: CategoryResponse | null
  categories: CategoryResponse[]
  isLoading?: boolean
}

export function AdminCategoryForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
  isLoading,
}: AdminCategoryFormProps) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [parentCode, setParentCode] = useState('')
  const [displayOrder, setDisplayOrder] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = !!initialData

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code)
      setName(initialData.name)
      setParentCode(initialData.parentCode || '')
      setDisplayOrder('')
    } else {
      setCode('')
      setName('')
      setParentCode('')
      setDisplayOrder('')
    }
    setErrors({})
  }, [initialData, isOpen])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!code.trim()) {
      newErrors.code = '카테고리 코드를 입력해주세요'
    } else if (!/^[A-Z_]+$/.test(code.trim())) {
      newErrors.code = '코드는 대문자와 언더스코어만 사용 가능합니다'
    }
    if (!name.trim()) {
      newErrors.name = '카테고리 이름을 입력해주세요'
    }
    if (displayOrder && isNaN(parseInt(displayOrder))) {
      newErrors.displayOrder = '표시 순서는 숫자여야 합니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validate()) return

    const data: CategoryCreateRequest = {
      code: code.trim(),
      name: name.trim(),
      parentCode: parentCode || undefined,
      displayOrder: displayOrder ? parseInt(displayOrder) : undefined,
    }

    await onSubmit(data)
  }

  // 자기 자신을 제외한 카테고리 목록 (부모 선택용)
  const availableParents = categories.filter((cat) => cat.id !== initialData?.id)
  const parentOptions = useMemo(() => flattenCategoriesForSelect(availableParents), [availableParents])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? '카테고리 수정' : '새 카테고리 만들기'}
          </h2>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="code">코드 *</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="예: CS, ENGLISH, DATA_STRUCTURE"
              className="mt-1"
              disabled={isLoading || isEdit}
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              대문자와 언더스코어만 사용 가능 (수정 불가)
            </p>
          </div>

          <div>
            <Label htmlFor="name">이름 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 컴퓨터 과학, 영어"
              className="mt-1"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {!isEdit && (
            <div>
              <Label htmlFor="parentCode">상위 카테고리</Label>
              <select
                id="parentCode"
                value={parentCode}
                onChange={(e) => setParentCode(e.target.value)}
                className="mt-1 w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              >
                <option value="">없음 (최상위)</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.code}>
                    {option.pathLabel} ({option.code})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                계층 구조를 만들려면 상위 카테고리를 선택하세요
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="displayOrder">표시 순서</Label>
            <Input
              id="displayOrder"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="기본값: 0"
              className="mt-1"
              disabled={isLoading}
            />
            {errors.displayOrder && (
              <p className="mt-1 text-sm text-red-600">{errors.displayOrder}</p>
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
                '카테고리 만들기'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
