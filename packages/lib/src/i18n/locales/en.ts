import type { STATUS_CODE } from '../../constants'
import type { ApiErrorKind } from '../../types/api'

export const EN_API_ERROR_MESSAGE = {
  network: 'Network unavailable',
  abort: 'Request has been cancelled',
  unauthorized: 'Unauthorized',
  forbidden: 'Insufficient access rights to perform this action',
  'not-found': 'Requested resource was not found',
  validation: 'Data validation error',
  conflict: 'Request conflicts with the current resource state',
  'rate-limited': 'Too many requests',
  business: 'Business logic error',
  server: 'Server error',
  unexpected: 'Unexpected error occurred',
} satisfies Record<ApiErrorKind, string>

export const EN_HTTP_ERROR_MESSAGE: Partial<Record<number, string>> = {
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not found',
  409: 'Conflict',
  422: 'Validation error',
  429: 'Too many requests',
  500: 'Server error',
  502: 'Bad gateway',
  503: 'Service unavailable',
  504: 'Gateway timeout',
} satisfies Record<typeof STATUS_CODE[keyof typeof STATUS_CODE], string>
