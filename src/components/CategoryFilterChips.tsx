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

function findPathCodes(nodes: CategoryTreeNode[], targetCode: string): string[] {
  for (const node of nodes) {
    if (node.code === targetCode) {
      return [node.code]
    }
    const childPath = findPathCodes(node.children, targetCode)
    if (childPath.length > 0) {
      return [node.code, ...childPath]
    }
  }
  return []
}

function collectNodeAndDescendantCodes(node: CategoryTreeNode): string[] {
  const codes: string[] = [node.code]
  node.children.forEach((child) => {
    codes.push(...collectNodeAndDescendantCodes(child))
  })
  return codes
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

  const selectedPath = useMemo(() => {
    if (selectedCategory === 'ALL') return []
    return findPathCodes(categoryTree, selectedCategory)
  }, [categoryTree, selectedCategory])

  useEffect(() => {
    if (selectedPath.length === 0) return
    setExpandedMap((prev) => {
      const next = { ...prev }
      let hasChanged = false

      selectedPath.forEach((code) => {
        if (!next[code]) {
          next[code] = true
          hasChanged = true
        }
      })

      return hasChanged ? next : prev
    })
  }, [selectedPath])

  function toggleExpanded(code: string) {
    setExpandedMap((prev) => ({ ...prev, [code]: !prev[code] }))
  }

  function handleNodeSelect(node: CategoryTreeNode) {
    if (node.children.length > 0) {
      const codesToExpand = collectNodeAndDescendantCodes(node)
      setExpandedMap((prev) => {
        const next = { ...prev }
        codesToExpand.forEach((code) => {
          next[code] = true
        })
        return next
      })
    }

    onChange(node.code)
  }

  function renderNode(node: CategoryTreeNode) {
    const hasChildren = node.children.length > 0
    const isExpanded = hasChildren && !!expandedMap[node.code]
    const isSelected = selectedCategory === node.code

    return (
      <div
        key={node.code}
        className={node.depth > 0 ? 'ml-2 border-l border-gray-200 pl-2' : ''}
      >
        <div
          className="flex items-center gap-1.5"
        >
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpanded(node.code)}
              aria-label={isExpanded ? `${node.name} 접기` : `${node.name} 펼치기`}
              className="h-8 w-8 rounded-md hover:bg-gray-100 text-gray-500 flex items-center justify-center shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <div className="h-8 w-8 flex items-center justify-center shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
            </div>
          )}
          <button
            type="button"
            onClick={() => handleNodeSelect(node)}
            className={`${buttonBaseClassName} inline-flex items-center justify-start text-left min-w-[88px] ${
              isSelected
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {node.name}
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {node.children.map((child) => renderNode(child))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-gray-50/70 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            setExpandedMap({})
            onChange('ALL')
          }}
          className={`${buttonBaseClassName} ${
            selectedCategory === 'ALL'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {allLabel}
        </button>
        <span className="text-xs text-gray-500">대/중/소 카테고리</span>
      </div>
      <div className="max-h-72 overflow-y-auto pr-1 space-y-1">
        {categoryTree.map((node) => renderNode(node))}
      </div>
    </div>
  )
}
