import { useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, Filter, Loader2 } from 'lucide-react'
import type { CategoryResponse } from '@/types/category'
import { CategoryFilterChips } from '@/components/CategoryFilterChips'

interface CategoryFilterSectionProps {
  categories: CategoryResponse[]
  isLoading?: boolean
  selectedCategory: string
  onChange: (code: string) => void
  className?: string
  title?: string
  loadingText?: string
  allLabel?: string
  buttonBaseClassName?: string
  collapsible?: boolean
  defaultOpen?: boolean
  autoCloseOnSelect?: boolean
}

export function CategoryFilterSection({
  categories,
  isLoading = false,
  selectedCategory,
  onChange,
  className,
  title = '카테고리',
  loadingText = '카테고리 로딩 중...',
  allLabel = '전체',
  buttonBaseClassName,
  collapsible = false,
  defaultOpen = false,
  autoCloseOnSelect = false,
}: CategoryFilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategory === 'ALL') return allLabel
    return categories.find((item) => item.code === selectedCategory)?.name ?? selectedCategory
  }, [allLabel, categories, selectedCategory])

  function handleChange(code: string) {
    onChange(code)
    if (collapsible && autoCloseOnSelect) {
      setIsOpen(false)
    }
  }

  if (!collapsible) {
    return (
      <div className={className}>
        <div className="flex items-start gap-3">
          <Filter className="h-4 w-4 text-gray-500 shrink-0 mt-1" />
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingText}
            </div>
          ) : (
            <CategoryFilterChips
              categories={categories}
              selectedCategory={selectedCategory}
              onChange={handleChange}
              allLabel={allLabel}
              buttonBaseClassName={buttonBaseClassName}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="rounded-xl border border-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-gray-50 rounded-xl"
        >
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {title}
          </span>
          <span className="inline-flex items-center gap-2 text-sm text-foreground">
            <span className="max-w-[160px] truncate">{selectedCategoryLabel}</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </span>
        </button>

        {isOpen && (
          <div className="border-t border-gray-100 px-4 py-3">
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {loadingText}
              </div>
            ) : (
              <CategoryFilterChips
                categories={categories}
                selectedCategory={selectedCategory}
                onChange={handleChange}
                allLabel={allLabel}
                buttonBaseClassName={buttonBaseClassName}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
