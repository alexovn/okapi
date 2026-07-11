import { FetchError } from 'ofetch'
import { ApiError, createApiErrorFromResponse, normalizeApiError } from '../core/apiError'
import type { ApiErrorAdapterOptions } from '../core/apiError'

export type ApiOfetchError<T = unknown> = FetchError<T>

export function getOfetchError(
  error: unknown,
  options?: ApiErrorAdapterOptions,
): ApiError {
  if (!(error instanceof FetchError)) {
    return normalizeApiError(error, options)
  }

  const status = typeof error.response?.status === 'number'
    ? error.response.status
    : getNumber(error.status) ?? getNumber(error.statusCode)

  if (typeof status === 'number') {
    return createApiErrorFromResponse({
      status,
      statusText: error.response?.statusText ?? error.statusText,
      body: error.response?._data ?? error.data,
    }, options)
  }

  return ApiError.getNetworkError(error, options)
}

function getNumber(value: unknown) {
  return typeof value === 'number' ? value : undefined
}
