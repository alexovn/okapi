import { FetchError } from 'ofetch'
import { ApiError, createApiErrorFromResponse, mapApiError, normalizeApiError } from '../core/apiError'
import type { ApiErrorAdapterOptions, ApiErrorMapper } from '../types/api'

export type ApiOfetchError<T = unknown> = FetchError<T>

export function getOfetchError<TCustomKind extends string = never>(
  error: unknown,
  options?: ApiErrorAdapterOptions<TCustomKind>,
): ApiError<TCustomKind> {
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

export function createOfetchErrorMapper<TCustomKind extends string = never>(
  options: ApiErrorAdapterOptions<TCustomKind> = {},
): ApiErrorMapper<TCustomKind> {
  return error => mapApiError(getOfetchError(error, options), options)
}
