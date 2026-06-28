import { ApiError, createApiErrorFromResponse } from '../core/apiError'
import type { ApiErrorAdapterOptions } from '../core/apiError'

export interface FetchResponseLike {
  status: number
  statusText?: string
}

export function fromFetchResponse(
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

export function fromNativeError(
  error: unknown,
  body?: unknown,
  options?: ApiErrorAdapterOptions,
): ApiError {
  if (isObject(error) && typeof error.status === 'number') {
    return fromFetchResponse(
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
    return ApiError.fromNetwork(error, options)
  }

  return ApiError.fromUnexpected(error, options)
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
