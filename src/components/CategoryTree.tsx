import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CategoryTreeResponse } from '@/types/category'
import type { DeckStats } from '@/types/stats'

interface CategoryTreeProps {
  tree: CategoryTreeResponse[]
  deckStats: DeckStats[]
}

const DECK_COLORS = [
  'border-l-primary',
  'border-l-green-500',
  'border-l-purple-500',
  'border-l-orange-500',
  'border-l-blue-500',
  'border-l-pink-500',
]

function getDeckColor(index: number): string {
  return DECK_COLORS[index % DECK_COLORS.length]
}

interface TreeNodeProps {
  node: CategoryTreeResponse
  deckStats: DeckStats[]
  depth: number
  colorIndex: number
}

// 노드와 모든 자식 노드의 통계를 합산하는 함수
function getAggregatedStats(node: CategoryTreeResponse, deckStats: DeckStats[]): DeckStats | undefined {
  const ownStats = deckStats.find((d) => d.category === node.code)

  // 자식이 없으면 자신의 통계만 반환
  if (node.children.length === 0) {
    return ownStats
  }

  // 자식들의 합산 통계 계산
  const childrenStats = node.children.reduce(
    (acc, child) => {
      const childStats = getAggregatedStats(child, deckStats)
      if (childStats) {
        acc.newCount += childStats.newCount
        acc.learningCount += childStats.learningCount
        acc.reviewCount += childStats.reviewCount
      }
      return acc
    },
    { newCount: 0, learningCount: 0, reviewCount: 0 }
  )

  // 자신의 통계 + 자식들의 통계
  return {
    category: node.code,
    newCount: (ownStats?.newCount ?? 0) + childrenStats.newCount,
    learningCount: (ownStats?.learningCount ?? 0) + childrenStats.learningCount,
    reviewCount: (ownStats?.reviewCount ?? 0) + childrenStats.reviewCount,
    masteryRate: ownStats?.masteryRate ?? 0,
  }
}

function TreeNode({ node, deckStats, depth, colorIndex }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(depth === 0)
  const hasChildren = node.children.length > 0
  const stats = getAggregatedStats(node, deckStats)

  return (
    <div>
      <div
        className={`p-4 rounded-lg border-l-4 ${getDeckColor(colorIndex)} bg-gray-50 hover:bg-gray-100 transition-colors`}
        style={{ marginLeft: Math.min(depth, 3) * 16 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            )}
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="h-4 w-4 text-gray-500" />
              ) : (
                <Folder className="h-4 w-4 text-gray-500" />
              )
            ) : (
              <div className="w-4" />
            )}
            <div>
              <div className="font-medium text-gray-900">{node.name}</div>
              {stats && (
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0 text-sm">
                  <span className="text-primary">{stats.newCount} 새 카드</span>
                  <span className="text-orange-600">{stats.learningCount} 학습 중</span>
                  <span className="text-green-600">{stats.reviewCount} 복습</span>
                </div>
              )}
            </div>
          </div>
          <Button size="sm" variant="outline" asChild className="min-h-[44px]">
            <Link to={`/study?deck=${encodeURIComponent(node.code)}`}>학습</Link>
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {node.children.map((child, idx) => (
            <TreeNode
              key={child.id}
              node={child}
              deckStats={deckStats}
              depth={depth + 1}
              colorIndex={colorIndex + idx + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CategoryTree({ tree, deckStats }: CategoryTreeProps) {
  if (tree.length === 0) {
    return <p className="text-gray-500 text-center py-4">아직 덱이 없습니다</p>
  }

  return (
    <div className="space-y-2">
      {tree.map((node, idx) => (
        <TreeNode
          key={node.id}
          node={node}
          deckStats={deckStats}
          depth={0}
          colorIndex={idx}
        />
      ))}
    </div>
  )
}
