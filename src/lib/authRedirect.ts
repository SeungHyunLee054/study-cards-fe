const LOGOUT_REDIRECT_FLAG_KEY = 'auth:redirect-home-once'

export function markLogoutRedirectToHome() {
  try {
    sessionStorage.setItem(LOGOUT_REDIRECT_FLAG_KEY, '1')
  } catch {
    // sessionStorage 접근 실패 시 무시
  }
}

export function consumeLogoutRedirectToHome(): boolean {
  try {
    const shouldRedirectHome = sessionStorage.getItem(LOGOUT_REDIRECT_FLAG_KEY) === '1'
    if (shouldRedirectHome) {
      sessionStorage.removeItem(LOGOUT_REDIRECT_FLAG_KEY)
    }
    return shouldRedirectHome
  } catch {
    return false
  }
}

export function clearLogoutRedirectToHome() {
  try {
    sessionStorage.removeItem(LOGOUT_REDIRECT_FLAG_KEY)
  } catch {
    // sessionStorage 접근 실패 시 무시
  }
}
