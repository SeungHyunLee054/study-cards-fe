import type { CategoryResponse } from '@/types/category'

interface CategoryFilterChipsProps {
  selectedCategory: string
  categories: CategoryResponse[]
  onChange: (code: string) => void
  allLabel?: string
  buttonBaseClassName?: string
}

export function CategoryFilterChips({
  selectedCategory,
  categories,
  onChange,
  allLabel = '전체',
  buttonBaseClassName = 'px-3 md:px-4 py-2 text-sm rounded-lg transition-colors min-h-[44px]',
}: CategoryFilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange('ALL')}
        className={`${buttonBaseClassName} ${
          selectedCategory === 'ALL'
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {allLabel}
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.code)}
          className={`${buttonBaseClassName} ${
            selectedCategory === cat.code
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
