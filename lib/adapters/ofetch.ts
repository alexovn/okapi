import type { FetchError } from 'ofetch'
import { ApiError, createApiErrorFromResponse } from '../core/apiError'

export type ApiOfetchError<T = unknown> = FetchError<T>

export function fromOfetchError<T = unknown>(
  error: FetchError<T>,
): ApiError {
  const status = typeof error.response?.status === 'number'
    ? error.response.status
    : getNumber(error.status) ?? getNumber(error.statusCode)

  if (typeof status === 'number') {
    return createApiErrorFromResponse({
      status,
      statusText: error.response?.statusText ?? error.statusText,
      body: error.response?._data ?? error.data,
    })
  }

  return ApiError.fromNetwork(error)
}

function getNumber(value: unknown) {
  return typeof value === 'number' ? value : undefined
}
