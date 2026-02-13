import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { CategoryTreeResponse } from '@/types/category'
import type { CategoryProgressItem } from '@/types/dashboard'
import {
  buildProgressMap,
  getAggregatedProgress,
} from '@/lib/categoryTreeUtils'

interface CategoryProgressTreeProps {
  tree: CategoryTreeResponse[]
  progressItems: CategoryProgressItem[]
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

interface ProgressNodeProps {
  node: CategoryTreeResponse
  progressMap: Map<string, CategoryProgressItem>
  depth: number
}

function ProgressNode({ node, progressMap, depth }: ProgressNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth === 0)
  const hasChildren = node.children.length > 0
  const agg = getAggregatedProgress(node, progressMap)

  if (agg.totalCards === 0 && !hasChildren) return null

  const barHeight = depth === 0 ? 'h-2' : depth === 1 ? 'h-1.5' : 'h-1'

  return (
    <div>
      <div style={{ paddingLeft: depth * 20 }}>
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-gray-100 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                )}
              </button>
            ) : (
              <div className="w-[26px]" />
            )}
            <span
              className={`text-gray-900 truncate ${depth === 0 ? 'font-semibold text-sm' : 'font-medium text-sm'}`}
            >
              {node.name}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-gray-500 text-xs">
              {agg.studiedCards}/{agg.totalCards} 학습
            </span>
            <span className="font-semibold text-primary text-xs">
              {formatPercent(agg.progressRate)}
            </span>
          </div>
        </div>
        <div className={`${barHeight} w-full rounded-full bg-gray-100 overflow-hidden`}>
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${agg.progressRate * 100}%` }}
          />
        </div>
        {depth === 0 && agg.masteryRate > 0 && (
          <div className="mt-0.5 text-xs text-gray-400">
            마스터리: {formatPercent(agg.masteryRate)}
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-3">
          {node.children.map((child) => (
            <ProgressNode
              key={child.id}
              node={child}
              progressMap={progressMap}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CategoryProgressTree({ tree, progressItems }: CategoryProgressTreeProps) {
  const progressMap = buildProgressMap(progressItems)

  if (tree.length === 0) {
    return <p className="text-gray-500 text-center py-4">아직 학습 기록이 없습니다</p>
  }

  return (
    <div className="space-y-4">
      {tree.map((node) => (
        <ProgressNode
          key={node.id}
          node={node}
          progressMap={progressMap}
          depth={0}
        />
      ))}
    </div>
  )
}
