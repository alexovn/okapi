export const API_ERROR_KIND = {
  NETWORK: 'network',
  ABORT: 'abort',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not-found',
  VALIDATION: 'validation',
  CONFLICT: 'conflict',
  RATE_LIMITED: 'rate-limited',
  BUSINESS: 'business',
  SERVER: 'server',
  UNEXPECTED: 'unexpected',
} as const

export const API_ERROR_TYPE = {
  AUTH: 'auth',
  BUSINESS: 'business',
  NETWORK: 'network',
  SERVER: 'server',
  UNEXPECTED: 'unexpected',
  VALIDATION: 'validation',
} as const
