const PAGE_HISTORY_STORAGE_KEY = 'study-cards:page-history'
const MAX_STACK_LENGTH = 100

function canUseSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

function readStack(): string[] {
  if (!canUseSessionStorage()) return []

  try {
    const raw = window.sessionStorage.getItem(PAGE_HISTORY_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0)
  } catch {
    return []
  }
}

function writeStack(stack: string[]) {
  if (!canUseSessionStorage()) return

  try {
    window.sessionStorage.setItem(PAGE_HISTORY_STORAGE_KEY, JSON.stringify(stack))
  } catch {
    // 저장 실패 시 무시
  }
}

export function recordPageVisit(pathname: string) {
  if (!pathname) return

  const stack = readStack()
  const last = stack[stack.length - 1]

  if (last === pathname) return

  const nextStack = [...stack, pathname].slice(-MAX_STACK_LENGTH)
  writeStack(nextStack)
}

export function popPreviousPage(currentPathname: string): string | null {
  const stack = readStack()
  if (stack.length === 0) return null

  const nextStack = [...stack]

  while (nextStack.length > 0 && nextStack[nextStack.length - 1] === currentPathname) {
    nextStack.pop()
  }

  const previousPath = nextStack[nextStack.length - 1] ?? null
  writeStack(nextStack)
  return previousPath
}
