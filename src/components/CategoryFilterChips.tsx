import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { CategoryResponse } from '@/types/category'
import type { CategoryTreeNode } from '@/lib/categoryHierarchy'
import { buildCategoryTreeFromFlat } from '@/lib/categoryHierarchy'

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
  const categoryTree = useMemo(() => buildCategoryTreeFromFlat(categories), [categories])
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setExpandedMap(() => {
      const next: Record<string, boolean> = {}
      categoryTree.forEach((node) => {
        next[node.code] = true
      })
      return next
    })
  }, [categoryTree])

  function isSelectedOrDescendant(node: CategoryTreeNode): boolean {
    if (selectedCategory === 'ALL') return false
    if (node.code === selectedCategory) return true
    return node.children.some((child) => isSelectedOrDescendant(child))
  }

  function toggleExpanded(code: string) {
    setExpandedMap((prev) => ({ ...prev, [code]: !prev[code] }))
  }

  function renderNode(node: CategoryTreeNode) {
    const hasChildren = node.children.length > 0
    const isExpanded = expandedMap[node.code] ?? false
    const shouldShowChildren = hasChildren && (isExpanded || isSelectedOrDescendant(node))

    return (
      <div key={node.code}>
        <div
          className="flex items-center gap-1"
          style={{ paddingLeft: node.depth * 16 }}
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpanded(node.code)}
              aria-label={isExpanded ? `${node.name} 접기` : `${node.name} 펼치기`}
              className="p-2 rounded hover:bg-gray-100 text-gray-500 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <div className="w-9" />
          )}
          <button
            type="button"
            onClick={() => onChange(node.code)}
            className={`${buttonBaseClassName} ${
              selectedCategory === node.code
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {node.name}
          </button>
        </div>

        {shouldShowChildren && (
          <div className="mt-1 space-y-1">
            {node.children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={() => onChange('ALL')}
        className={`${buttonBaseClassName} ${
          selectedCategory === 'ALL'
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {allLabel}
      </button>
      <div className="space-y-1">
        {categoryTree.map((node) => renderNode(node))}
      </div>
    </div>
  )
}
