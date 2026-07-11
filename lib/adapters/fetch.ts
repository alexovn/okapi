import { ApiError, createApiErrorFromResponse, normalizeApiError } from '../core/apiError'
import type { ApiErrorAdapterOptions } from '../types/api'

export interface FetchResponseLike {
  status: number
  statusText?: string
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getFetchResponseError(
  response: FetchResponseLike,
  body?: unknown,
  options?: ApiErrorAdapterOptions,
): ApiError {
  return createApiErrorFromResponse({
    status: response.status,
    statusText: response.statusText,
    body,
  }, options)
}

export function getFetchError(
  error: unknown,
  body?: unknown,
  options?: ApiErrorAdapterOptions,
): ApiError {
  if (isObject(error) && typeof error.status === 'number') {
    return getFetchResponseError(
      {
        status: error.status,
        statusText: typeof error.statusText === 'string'
          ? error.statusText
          : undefined,
      },
      body ?? error.body,
      options,
    )
  }

  if (error instanceof TypeError) {
    return ApiError.getNetworkError(error, options)
  }

  return normalizeApiError(error, options)
}
