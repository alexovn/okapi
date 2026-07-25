import type { OkapiErrorMessages, OkapiErrorTitles } from '../../src'

export const TITLES: OkapiErrorTitles = {
  unauthorized: 'Authentication required',
  forbidden: 'Access denied',
  'not-found': 'Not found',
  validation: 'Check the form',
  'rate-limited': 'Too many requests',
  server: 'Server error',
  network: 'Connection problem',
  unexpected: 'Something went wrong',
}

export const MESSAGES: OkapiErrorMessages = {
  unauthorized: 'Sign in to continue.',
  forbidden: 'You do not have permission to perform this action.',
  'not-found': 'The requested resource could not be found.',
  validation: 'Some fields contain invalid values.',
  'rate-limited': 'Please wait before trying again.',
  server: 'We could not complete your request. Please try again.',
  network: 'Check your internet connection and try again.',
  unexpected: 'An unexpected error occurred. Please try again.',
}

export const HTTP_CASES = [
  [401, 'Authentication required', 'Sign in to continue.'],
  [403, 'Access denied', 'You do not have permission to perform this action.'],
  [404, 'Not found', 'The requested resource could not be found.'],
  [422, 'Check the form', 'Some fields contain invalid values.'],
  [429, 'Too many requests', 'Please wait before trying again.'],
  [500, 'Server error', 'We could not complete your request. Please try again.'],
  [503, 'Temporarily unavailable', 'We could not complete your request. Please try again.'],
  [504, 'Request timed out', 'We could not complete your request. Please try again.'],
] as const
