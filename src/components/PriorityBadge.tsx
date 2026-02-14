import { cn } from '@/lib/utils'
import type { PriorityLevel } from '@/types/recommendation'

function getPriorityLevel(score: number): PriorityLevel {
  if (score >= 1000) return 'critical'
  if (score >= 500) return 'high'
  if (score >= 300) return 'medium'
  return 'normal'
}

function getPriorityLabel(level: PriorityLevel): string {
  switch (level) {
    case 'critical': return '긴급'
    case 'high': return '높음'
    case 'medium': return '보통'
    case 'normal': return '일반'
  }
}

const PRIORITY_STYLES: Record<PriorityLevel, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  normal: 'bg-green-100 text-green-700 border-green-200',
}

interface PriorityBadgeProps {
  score: number
  className?: string
}

export function PriorityBadge({ score, className }: PriorityBadgeProps) {
  const level = getPriorityLevel(score)
  const label = getPriorityLabel(level)

  return (
    <span
      className={cn(
        'text-xs font-medium px-2 py-0.5 rounded-full border',
        PRIORITY_STYLES[level],
        className,
      )}
    >
      {label}
    </span>
  )
}
