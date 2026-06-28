import type { ApiErrorKind, HttpErrorMessages } from '../../core/apiError'

export const EN_API_ERROR_MESSAGES = {
  network: 'Network unavailable. Please try again later.',
  abort: 'Request has been cancelled.',
  unauthorized: 'Unauthorized. Please sign in again.',
  forbidden: 'You do not have permission to perform this action.',
  'not-found': 'Requested resource was not found.',
  validation: 'Data validation error.',
  conflict: 'Request conflicts with the current resource state.',
  'rate-limited': 'Too many requests. Please try again later.',
  business: 'Business logic error.',
  server: 'Server error. Please try again later.',
  unexpected: 'Unexpected error occurred.',
} satisfies Record<ApiErrorKind, string>

export const EN_HTTP_ERROR_MESSAGES: HttpErrorMessages = {
  400: 'Bad request.',
  401: 'Unauthorized.',
  403: 'Forbidden.',
  404: 'Not found.',
  409: 'Conflict.',
  422: 'Validation error.',
  429: 'Too many requests.',
  500: 'Server error.',
  502: 'Bad gateway.',
  503: 'Service unavailable.',
  504: 'Gateway timeout.',
}
