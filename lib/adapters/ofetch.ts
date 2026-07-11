import { FetchError } from 'ofetch'
import { ApiError, createApiErrorFromResponse, normalizeApiError } from '../core/apiError'
import type { ApiErrorAdapterOptions } from '../types/api'

export type ApiOfetchError<T = unknown> = FetchError<T>

export function getOfetchError(
  error: unknown,
  options?: ApiErrorAdapterOptions,
): ApiError {
  if (!(error instanceof FetchError)) {
    return normalizeApiError(error, options)
  }

  if (error.response) {
    return createApiErrorFromResponse({
      status: error.response.status,
      statusText: error.response.statusText,
      body: error.response._data,
    }, options)
  }

  return ApiError.getNetworkError(error, options)
}
