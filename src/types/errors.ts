export class AuthError extends Error {
  code: string
  email?: string

  constructor(message: string, code: string, email?: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.email = email
  }
}
