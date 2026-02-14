interface InlineErrorProps {
  message: string
  onClose?: () => void
  className?: string
}

export function InlineError({ message, onClose, className }: InlineErrorProps) {
  return (
    <div className={`p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm ${className || ''}`}>
      {message}
      {onClose && (
        <button onClick={onClose} className="ml-2 text-red-900 hover:underline">
          닫기
        </button>
      )}
    </div>
  )
}
