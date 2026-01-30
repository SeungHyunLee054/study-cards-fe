import { cn } from '@/lib/utils'

interface DifficultyGaugeProps {
  efFactor: number
  className?: string
}

export function DifficultyGauge({ efFactor, className }: DifficultyGaugeProps) {
  // efFactor ranges from 1.3 (hard) to 2.5 (easy)
  // Normalize to 0-100 for display
  const normalizedValue = Math.min(
    100,
    Math.max(0, ((efFactor - 1.3) / (2.5 - 1.3)) * 100)
  )

  const getColor = () => {
    if (normalizedValue < 33) return 'bg-red-500'
    if (normalizedValue < 66) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getLabel = () => {
    if (normalizedValue < 33) return 'Hard'
    if (normalizedValue < 66) return 'Medium'
    return 'Easy'
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Difficulty</span>
        <span>{getLabel()}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary">
        <div
          className={cn('h-full rounded-full transition-all', getColor())}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground text-right">
        EF: {efFactor.toFixed(2)}
      </div>
    </div>
  )
}
