import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { CategoryTreeResponse } from '@/types/category'
import { cn } from '@/lib/utils'

interface CategoryFilterTreeProps {
  tree: CategoryTreeResponse[]
  selectedCategory: string | undefined
  onSelect: (categoryCode: string | undefined) => void
}

function isNodeOrDescendantSelected(
  node: CategoryTreeResponse,
  selectedCategory: string | undefined,
): boolean {
  if (!selectedCategory) return false
  if (node.code === selectedCategory) return true
  return node.children.some((child) =>
    isNodeOrDescendantSelected(child, selectedCategory),
  )
}

interface FilterNodeProps {
  node: CategoryTreeResponse
  selectedCategory: string | undefined
  onSelect: (categoryCode: string | undefined) => void
  depth: number
}

function FilterNode({ node, selectedCategory, onSelect, depth }: FilterNodeProps) {
  const hasChildren = node.children.length > 0
  const isSelected = selectedCategory === node.code
  const [isExpanded, setIsExpanded] = useState(
    depth === 0 || isNodeOrDescendantSelected(node, selectedCategory),
  )

  return (
    <div>
      <div
        className="flex items-center gap-1"
        style={{ paddingLeft: depth * 16 }}
      >
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-secondary/60 rounded shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-[30px]" />
        )}
        <button
          onClick={() => onSelect(node.code)}
          className={cn(
            'px-3 py-2 text-sm rounded-lg transition-colors min-h-[44px]',
            isSelected
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          )}
        >
          {node.name}
        </button>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {node.children.map((child) => (
            <FilterNode
              key={child.id}
              node={child}
              selectedCategory={selectedCategory}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CategoryFilterTree({
  tree,
  selectedCategory,
  onSelect,
}: CategoryFilterTreeProps) {
  return (
    <div className="space-y-1">
      <button
        onClick={() => onSelect(undefined)}
        className={cn(
          'px-4 py-2.5 text-sm rounded-lg transition-colors min-h-[44px]',
          !selectedCategory
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        )}
      >
        전체
      </button>
      {tree.map((node) => (
        <FilterNode
          key={node.id}
          node={node}
          selectedCategory={selectedCategory}
          onSelect={onSelect}
          depth={0}
        />
      ))}
    </div>
  )
}
