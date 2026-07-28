import type { OkapiErrorMessages, OkapiErrorTitles } from '../../src'

export const TITLES: OkapiErrorTitles = {
  unauthorized: 'Authentication Required',
  forbidden: 'Access Denied',
  'not-found': 'Not Found',
  validation: 'Validation Error',
  'rate-limited': 'Too Many Requests',
  server: 'Server Error',
  network: 'Connection Problem',
  unexpected: 'Unexpected Error',
}

export const MESSAGES: OkapiErrorMessages = {
  unauthorized: 'Sign in to continue.',
  forbidden: 'You do not have permission to perform this action.',
  'not-found': 'The requested resource could not be found.',
  validation: 'Passed data has issues',
  'rate-limited': 'Please wait before trying again.',
  server: 'We could not complete your request. Please try again.',
  network: 'Check your internet connection and try again.',
  unexpected: 'Unexpected error',
}

export const HTTP_CASES = [
  [401, 'Authentication Required', 'Sign in to continue.'],
  [403, 'Access Denied', 'You do not have permission to perform this action.'],
  [404, 'Not Found', 'The requested resource could not be found.'],
  [422, 'Validation Error', 'Passed data has issues'],
  [429, 'Too Many Requests', 'Please wait before trying again.'],
  [500, 'Server Error', 'We could not complete your request. Please try again.'],
  [503, 'Temporarily unavailable', 'We could not complete your request. Please try again.'],
  [504, 'Request timed out', 'We could not complete your request. Please try again.'],
] as const
